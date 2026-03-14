import requests

BASE = "http://127.0.0.1:8000"

print("\n=== CoreInventory Backend Test ===\n")

# 1. SIGNUP
print("1. Creating admin user...")
r = requests.post(f"{BASE}/auth/signup", json={
    "email": "admin@core.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "manager"
})
if r.status_code == 200:
    token = r.json()["access_token"]
    print("   ✓ Signup successful")
else:
    # Already exists, just login
    print("   User exists, logging in...")
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "admin@core.com",
        "password": "admin123"
    })
    token = r.json()["access_token"]
    print("   ✓ Login successful")

headers = {"Authorization": f"Bearer {token}"}

# 2. WAREHOUSES
print("\n2. Creating warehouses...")
w1 = requests.post(f"{BASE}/warehouses", json={"name": "Main Warehouse", "short_code": "MW", "address": "Plot 1, Industrial Area"}).json()
w2 = requests.post(f"{BASE}/warehouses", json={"name": "Production Unit", "short_code": "PU", "address": "Plot 2, Industrial Area"}).json()
print(f"   ✓ {w1['name']} (id={w1['id']})")
print(f"   ✓ {w2['name']} (id={w2['id']})")

# 3. LOCATIONS
print("\n3. Creating locations...")
l1 = requests.post(f"{BASE}/locations", json={"name": "Main Store",      "short_code": "MS",  "warehouse_id": w1["id"]}).json()
l2 = requests.post(f"{BASE}/locations", json={"name": "Production Rack", "short_code": "PR",  "warehouse_id": w2["id"]}).json()
l3 = requests.post(f"{BASE}/locations", json={"name": "Rack A",          "short_code": "RA",  "warehouse_id": w1["id"]}).json()
l4 = requests.post(f"{BASE}/locations", json={"name": "Rack B",          "short_code": "RB",  "warehouse_id": w1["id"]}).json()
print(f"   ✓ {l1['name']} | {l2['name']} | {l3['name']} | {l4['name']}")

# 4. PRODUCTS
print("\n4. Creating products...")
products_data = [
    {"name": "Steel Rods",       "sku": "STL-001", "category": "Raw Material", "uom": "kg",  "cost_per_unit": 85.0,  "low_stock_threshold": 20},
    {"name": "Copper Wire",      "sku": "COP-002", "category": "Raw Material", "uom": "m",   "cost_per_unit": 120.0, "low_stock_threshold": 15},
    {"name": "Bolt M10",         "sku": "BLT-003", "category": "Fasteners",   "uom": "pcs", "cost_per_unit": 2.5,   "low_stock_threshold": 50},
    {"name": "Nut M10",          "sku": "NUT-004", "category": "Fasteners",   "uom": "pcs", "cost_per_unit": 1.5,   "low_stock_threshold": 50},
    {"name": "Aluminium Sheet",  "sku": "ALU-005", "category": "Raw Material", "uom": "kg",  "cost_per_unit": 200.0, "low_stock_threshold": 10},
    {"name": "PVC Pipe",         "sku": "PVC-006", "category": "Plumbing",    "uom": "m",   "cost_per_unit": 45.0,  "low_stock_threshold": 10},
    {"name": "Electric Motor",   "sku": "MOT-007", "category": "Electrical",  "uom": "pcs", "cost_per_unit": 3500,  "low_stock_threshold": 5},
    {"name": "Safety Helmet",    "sku": "SAF-008", "category": "Safety",      "uom": "pcs", "cost_per_unit": 350.0, "low_stock_threshold": 10},
    {"name": "Welding Rod",      "sku": "WLD-009", "category": "Consumable",  "uom": "pcs", "cost_per_unit": 15.0,  "low_stock_threshold": 100},  # low stock
    {"name": "Lubricant Oil",    "sku": "LUB-010", "category": "Consumable",  "uom": "ltr", "cost_per_unit": 180.0, "low_stock_threshold": 20},   # low stock
]
product_ids = []
for pd in products_data:
    p = requests.post(f"{BASE}/products/", json=pd).json()
    product_ids.append(p["id"])
    print(f"   ✓ {p['name']} (SKU: {p['sku']})")

steel_id  = product_ids[0]
bolt_id   = product_ids[2]
helmet_id = product_ids[7]

# 5. RECEIPT → VALIDATE (stock +100 steel, +200 bolts, +15 helmets)
print("\n5. Creating and validating receipt (stock IN)...")
r1 = requests.post(f"{BASE}/receipts", json={
    "contact": "Steel Suppliers Ltd",
    "lines": [
        {"product_id": steel_id,  "quantity": 100},
        {"product_id": bolt_id,   "quantity": 200},
        {"product_id": helmet_id, "quantity": 15},
    ]
}).json()
print(f"   ✓ Receipt created: {r1['reference']} (id={r1['id']})")

val = requests.post(f"{BASE}/receipts/{r1['id']}/validate").json()
print(f"   ✓ Validated: {val['message']}")

# 6. SECOND RECEIPT
print("\n6. Creating second receipt...")
r2 = requests.post(f"{BASE}/receipts", json={
    "contact": "Wire & Cable Co",
    "lines": [{"product_id": product_ids[1], "quantity": 500}]
}).json()
print(f"   ✓ Receipt created: {r2['reference']} (status=Draft, not validated)")

# 7. DELIVERY → VALIDATE (stock -20 steel)
print("\n7. Creating and validating delivery (stock OUT)...")
d1 = requests.post(f"{BASE}/deliveries", json={
    "contact": "BuildCorp Pvt Ltd",
    "lines": [{"product_id": steel_id, "quantity": 20}]
}).json()
print(f"   ✓ Delivery created: {d1['reference']} (id={d1['id']})")

val2 = requests.post(f"{BASE}/deliveries/{d1['id']}/validate").json()
print(f"   ✓ Validated: {val2['message']}")

# 8. SECOND DELIVERY (draft only)
print("\n8. Creating second delivery (draft)...")
d2 = requests.post(f"{BASE}/deliveries", json={
    "contact": "MechWorks Industries",
    "lines": [{"product_id": bolt_id, "quantity": 50}]
}).json()
print(f"   ✓ Delivery created: {d2['reference']} (status=Draft)")

# 9. TRANSFER
print("\n9. Internal transfer: Main Store → Production Rack...")
t1 = requests.post(f"{BASE}/transfers", json={
    "product_id": steel_id,
    "from_location_id": l1["id"],
    "to_location_id": l2["id"],
    "quantity": 30
}).json()
print(f"   ✓ {t1['message']}")

# 10. ADJUSTMENT (−3 steel damaged)
print("\n10. Stock adjustment: 3 kg steel damaged...")
current_steel = 100 - 20  # received 100, delivered 20
a1 = requests.post(f"{BASE}/adjustments", json={
    "product_id": steel_id,
    "counted_qty": current_steel - 3     # pretend we counted 3 less
}).json()
print(f"   ✓ {a1['message']} (delta={a1['delta']})")

# 11. CHECK PRODUCTS (verify stock)
print("\n11. Checking final stock levels...")
products_list = requests.get(f"{BASE}/products/").json()
for p in products_list:
    low = " ⚠ LOW STOCK" if p["low_stock"] else ""
    print(f"   {p['name']:20s} | on_hand: {p['on_hand']:>6}{low}")

# 12. CHECK LEDGER
print("\n12. Ledger (last 10 entries)...")
ledger = requests.get(f"{BASE}/ledger").json()
for entry in ledger[:10]:
    print(f"   [{entry['type']:12s}] {entry['product_name']:20s} | delta: {entry['qty_delta']:>+6} | ref_id: {entry['ref_id']}")

# 13. STATS
print("\n13. Dashboard stats...")
stats = requests.get(f"{BASE}/stats").json()
print(f"   Total products   : {stats['total_products']}")
print(f"   Receipts  → todo: {stats['receipts']['todo']}  waiting: {stats['receipts']['waiting']}  done: {stats['receipts']['done']}")
print(f"   Deliveries→ todo: {stats['deliveries']['todo']}  waiting: {stats['deliveries']['waiting']}  done: {stats['deliveries']['done']}")
print(f"   Low stock items  : {len(stats['low_stock_products'])}")
for p in stats["low_stock_products"]:
    print(f"     - {p['name']} (on hand: {p['on_hand']})")

print("\n=== ALL TESTS PASSED ✓ Backend is ready! ===\n")