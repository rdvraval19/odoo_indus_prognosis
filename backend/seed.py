# import requests

# BASE = "http://localhost:8000"  # change to prod URL when deploying

# # ── Auth ──────────────────────────────────────────────
# requests.post(f"{BASE}/auth/signup", json={
#     "email": "admin@demo.com", "password": "demo1234", "role": "manager"
# })
# token = requests.post(f"{BASE}/auth/login", json={
#     "email": "admin@demo.com", "password": "demo1234"
# }).json()["access_token"]

# H = {"Authorization": f"Bearer {token}"}

# # ── Warehouses ────────────────────────────────────────
# w1 = requests.post(f"{BASE}/warehouses", json={"name": "Main Warehouse", "short_code": "MW", "address": "123 Main St"}, headers=H).json()
# w2 = requests.post(f"{BASE}/warehouses", json={"name": "Cold Storage", "short_code": "CS", "address": "456 Cold Ave"}, headers=H).json()

# # ── Locations ─────────────────────────────────────────
# l1 = requests.post(f"{BASE}/locations", json={"name": "Rack A", "short_code": "RA", "warehouse_id": w1["id"]}, headers=H).json()
# l2 = requests.post(f"{BASE}/locations", json={"name": "Rack B", "short_code": "RB", "warehouse_id": w1["id"]}, headers=H).json()
# l3 = requests.post(f"{BASE}/locations", json={"name": "Cold Zone 1", "short_code": "CZ1", "warehouse_id": w2["id"]}, headers=H).json()
# l4 = requests.post(f"{BASE}/locations", json={"name": "Cold Zone 2", "short_code": "CZ2", "warehouse_id": w2["id"]}, headers=H).json()

# # ── Products (10 total, 2 low-stock) ──────────────────
# products = []
# items = [
#     ("Rice 25kg", "RICE-25", "Grains", "KG", 200),
#     ("Wheat Flour", "WF-001", "Grains", "KG", 150),
#     ("Cooking Oil", "OIL-001", "Oils", "L", 80),
#     ("Sugar 1kg", "SUG-001", "Dry Goods", "KG", 300),
#     ("Salt 500g", "SAL-001", "Dry Goods", "KG", 250),
#     ("Tomato Paste", "TP-001", "Canned", "Tin", 120),
#     ("Canned Beans", "CB-001", "Canned", "Tin", 90),
#     ("Milk Powder", "MP-001", "Dairy", "KG", 60),
#     ("Butter 250g", "BUT-001", "Dairy", "Pcs", 5),   # LOW STOCK
#     ("Cheese Block", "CHE-001", "Dairy", "KG", 3),    # LOW STOCK
# ]
# for name, sku, cat, uom, stock in items:
#     p = requests.post(f"{BASE}/products", json={
#         "name": name, "sku": sku, "category": cat,
#         "uom": uom, "initial_stock": stock
#     }, headers=H).json()
#     products.append(p)

# print("✅ Products seeded")

# # ── Receipts ──────────────────────────────────────────
# for i in range(3):
#     r = requests.post(f"{BASE}/receipts", json={
#         "reference": f"REC-00{i+1}",
#         "lines": [{"product_id": products[i]["id"], "qty": 100}]
#     }, headers=H).json()
#     requests.post(f"{BASE}/receipts/{r['id']}/validate", headers=H)

# print("✅ Receipts seeded")

# # ── Deliveries ────────────────────────────────────────
# for i in range(2):
#     d = requests.post(f"{BASE}/deliveries", json={
#         "reference": f"DEL-00{i+1}",
#         "lines": [{"product_id": products[i]["id"], "qty": 20}]
#     }, headers=H).json()
#     requests.post(f"{BASE}/deliveries/{d['id']}/validate", headers=H)

# print("✅ Deliveries seeded")

# # ── Transfer ──────────────────────────────────────────
# requests.post(f"{BASE}/transfers", json={
#     "product_id": products[0]["id"],
#     "from_location": l1["id"],
#     "to_location": l2["id"],
#     "qty": 30
# }, headers=H)

# print("✅ Transfer seeded")

# # ── Adjustment ────────────────────────────────────────
# requests.post(f"{BASE}/adjustments", json={
#     "product_id": products[0]["id"],
#     "qty_delta": -3
# }, headers=H)

# print("✅ Adjustment seeded")
# print("\n🎉 All done! Full flow seeded successfully.")

import requests
import sys

# ─────────────────────────────────────────────────────────────
# CHANGE THIS URL:
#   Development → http://localhost:8000
#   Production  → https://your-backend.up.railway.app
# ─────────────────────────────────────────────────────────────
BASE = "http://localhost:8000"

print("=" * 50)
print(f"  Seeding against: {BASE}")
print("=" * 50)

# ─────────────────────────────────────────────────────────────
# HELPER FUNCTION
# Makes API calls and stops the script immediately if
# something goes wrong — so you know exactly which step failed
# ─────────────────────────────────────────────────────────────
def post(endpoint, payload, headers=None, label=""):
    url = f"{BASE}{endpoint}"
    r = requests.post(url, json=payload, headers=headers or {})
    if r.status_code not in (200, 201):
        print(f"\n❌ FAILED at: {label}")
        print(f"   URL     : {url}")
        print(f"   Status  : {r.status_code}")
        print(f"   Response: {r.text}")
        sys.exit(1)
    return r.json()


def patch(endpoint, payload, headers=None, label=""):
    url = f"{BASE}{endpoint}"
    r = requests.patch(url, json=payload, headers=headers or {})
    if r.status_code not in (200, 201):
        print(f"\n❌ FAILED at: {label}")
        print(f"   URL     : {url}")
        print(f"   Status  : {r.status_code}")
        print(f"   Response: {r.text}")
        sys.exit(1)
    return r.json()


# ─────────────────────────────────────────────────────────────
# STEP 1 — CREATE ADMIN USER + GET TOKEN
# Creates the demo login account.
# If the account already exists (400), that is fine — just log in.
# ─────────────────────────────────────────────────────────────
print("\n[1/8] Creating admin user...")

signup_res = requests.post(f"{BASE}/auth/signup", json={
    "email":    "admin@demo.com",
    "password": "demo1234",
    "role":     "manager",
})

# 400 means user already exists — that is OK, just continue to login
if signup_res.status_code not in (200, 201, 400):
    print(f"❌ Signup failed: {signup_res.status_code} — {signup_res.text}")
    sys.exit(1)

# Log in to get the JWT token
login_res = requests.post(f"{BASE}/auth/login", json={
    "email":    "admin@demo.com",
    "password": "demo1234",
})

if login_res.status_code != 200:
    print(f"❌ Login failed: {login_res.status_code} — {login_res.text}")
    sys.exit(1)

token = login_res.json()["access_token"]

# This header goes on EVERY request from now on
H = {"Authorization": f"Bearer {token}"}

print("   ✅ Auth done — admin@demo.com / demo1234")


# ─────────────────────────────────────────────────────────────
# STEP 2 — CREATE 2 WAREHOUSES
# w1 = Main Warehouse (general storage)
# w2 = Cold Storage (temperature controlled)
# ─────────────────────────────────────────────────────────────
print("\n[2/8] Creating warehouses...")

w1 = post("/warehouses", {
    "name":       "Main Warehouse",
    "short_code": "MW",
    "address":    "12 Industrial Road, Mumbai",
}, headers=H, label="Create Main Warehouse")

w2 = post("/warehouses", {
    "name":       "Cold Storage",
    "short_code": "CS",
    "address":    "45 Cooling Lane, Pune",
}, headers=H, label="Create Cold Storage")

print(f"   ✅ Main Warehouse (ID: {w1['id']}) + Cold Storage (ID: {w2['id']})")


# ─────────────────────────────────────────────────────────────
# STEP 3 — CREATE 4 LOCATIONS
# 2 locations inside Main Warehouse (Rack A, Rack B)
# 2 locations inside Cold Storage (Cold Zone 1, Cold Zone 2)
# ─────────────────────────────────────────────────────────────
print("\n[3/8] Creating locations...")

l1 = post("/locations", {
    "name":         "Rack A",
    "short_code":   "RA",
    "warehouse_id": w1["id"],
}, headers=H, label="Create Rack A")

l2 = post("/locations", {
    "name":         "Rack B",
    "short_code":   "RB",
    "warehouse_id": w1["id"],
}, headers=H, label="Create Rack B")

l3 = post("/locations", {
    "name":         "Cold Zone 1",
    "short_code":   "CZ1",
    "warehouse_id": w2["id"],
}, headers=H, label="Create Cold Zone 1")

l4 = post("/locations", {
    "name":         "Cold Zone 2",
    "short_code":   "CZ2",
    "warehouse_id": w2["id"],
}, headers=H, label="Create Cold Zone 2")

print(f"   ✅ Rack A (RA), Rack B (RB) → Main Warehouse")
print(f"   ✅ Cold Zone 1 (CZ1), Cold Zone 2 (CZ2) → Cold Storage")


# ─────────────────────────────────────────────────────────────
# STEP 4 — CREATE 10 PRODUCTS
# Last 2 products (Butter, Cheese) have very low stock
# so they show up in the dashboard low-stock alerts
#
# Format: (name, sku, category, uom, initial_stock, low_stock_threshold)
# ─────────────────────────────────────────────────────────────
print("\n[4/8] Creating 10 products...")

ITEMS = [
    # name           sku         category     uom   stock  threshold
    ("Rice 25kg",    "RICE-25",  "Grains",    "KG",   200,  50),
    ("Wheat Flour",  "WF-001",   "Grains",    "KG",   150,  30),
    ("Cooking Oil",  "OIL-001",  "Oils",      "L",     80,  20),
    ("Sugar 1kg",    "SUG-001",  "Dry Goods", "KG",   300,  50),
    ("Salt 500g",    "SAL-001",  "Dry Goods", "KG",   250,  40),
    ("Tomato Paste", "TP-001",   "Canned",    "Tin",  120,  25),
    ("Canned Beans", "CB-001",   "Canned",    "Tin",   90,  20),
    ("Milk Powder",  "MP-001",   "Dairy",     "KG",    60,  15),
    ("Butter 250g",  "BUT-001",  "Dairy",     "Pcs",    4,  10),  # LOW STOCK
    ("Cheese Block", "CHE-001",  "Dairy",     "KG",     3,  10),  # LOW STOCK
]

prods = []
for name, sku, cat, uom, stock, thresh in ITEMS:
    p = post("/products", {
        "name":                name,
        "sku":                 sku,
        "category":            cat,
        "uom":                 uom,
        "initial_stock":       stock,
        "low_stock_threshold": thresh,
    }, headers=H, label=f"Create product {name}")
    prods.append(p)
    flag = " ← LOW STOCK" if stock <= thresh else ""
    print(f"   • {name:20s} | stock: {stock:>4} {uom}{flag}")

print(f"   ✅ 10 products created (2 low-stock: Butter={prods[8]['stock']}, Cheese={prods[9]['stock']})")


# ─────────────────────────────────────────────────────────────
# STEP 5 — CREATE + VALIDATE 3 RECEIPTS
# A receipt = stock ARRIVING into the warehouse
# Creating a receipt alone does not update stock (status = Draft)
# Calling /validate updates stock and writes ledger rows
# ─────────────────────────────────────────────────────────────
print("\n[5/8] Creating and validating 3 receipts...")

RECEIPTS = [
    # (reference, product index, qty)
    ("REC-001", 0, 100),   # Rice +100
    ("REC-002", 1, 100),   # Wheat Flour +100
    ("REC-003", 2,  80),   # Cooking Oil +80
]

for ref, prod_idx, qty in RECEIPTS:
    # Step A — Create the receipt in Draft status
    rec = post("/receipts", {
        "reference": ref,
        "supplier":  "Demo Supplier Co.",
        "lines": [
            {
                "product_id": prods[prod_idx]["id"],
                "qty":        qty,
            }
        ],
    }, headers=H, label=f"Create receipt {ref}")

    # Step B — Validate: this writes the ledger row and sets status to Done
    val = requests.post(
        f"{BASE}/receipts/{rec['id']}/validate",
        headers=H
    )
    if val.status_code not in (200, 201):
        print(f"❌ Validate receipt {ref} failed: {val.status_code} — {val.text}")
        sys.exit(1)

    print(f"   • {ref}: {prods[prod_idx]['name']} +{qty} → Done ✅")

print("   ✅ 3 receipts created and validated")


# ─────────────────────────────────────────────────────────────
# STEP 6 — CREATE + VALIDATE 2 DELIVERIES
# A delivery = stock LEAVING the warehouse
# Validating checks there is enough stock (won't go negative)
# and writes a negative ledger row
# ─────────────────────────────────────────────────────────────
print("\n[6/8] Creating and validating 2 deliveries...")

DELIVERIES = [
    # (reference, product index, qty)
    ("DEL-001", 0, 20),   # Rice -20
    ("DEL-002", 1, 15),   # Wheat Flour -15
]

for ref, prod_idx, qty in DELIVERIES:
    # Step A — Create the delivery in Draft status
    dlv = post("/deliveries", {
        "reference": ref,
        "customer":  "Demo Customer Ltd.",
        "lines": [
            {
                "product_id": prods[prod_idx]["id"],
                "qty":        qty,
            }
        ],
    }, headers=H, label=f"Create delivery {ref}")

    # Step B — Validate: checks stock, writes ledger row, sets status Done
    val = requests.post(
        f"{BASE}/deliveries/{dlv['id']}/validate",
        headers=H
    )
    if val.status_code not in (200, 201):
        print(f"❌ Validate delivery {ref} failed: {val.status_code} — {val.text}")
        print(f"   This usually means insufficient stock.")
        sys.exit(1)

    print(f"   • {ref}: {prods[prod_idx]['name']} -{qty} → Done ✅")

print("   ✅ 2 deliveries created and validated")


# ─────────────────────────────────────────────────────────────
# STEP 7 — CREATE 1 INTERNAL TRANSFER
# Moves 30kg of Rice from Rack A to Rack B
# Total Rice stock stays the same — only location changes
# Writes 2 ledger rows: -30 from Rack A, +30 to Rack B
# ─────────────────────────────────────────────────────────────
print("\n[7/8] Creating 1 internal transfer...")

transfer = post("/transfers", {
    "product_id":    prods[0]["id"],   # Rice 25kg
    "from_location": l1["id"],         # Rack A
    "to_location":   l2["id"],         # Rack B
    "qty":           30,
}, headers=H, label="Create transfer Rice Rack A → Rack B")

print(f"   • Rice 25kg: Rack A → Rack B, qty 30")
print("   ✅ Transfer created")


# ─────────────────────────────────────────────────────────────
# STEP 8 — CREATE 1 STOCK ADJUSTMENT
# Corrects Rice stock by -3 (physical count found 3 less)
# Writes 1 ledger row with qty_delta = -3
# ─────────────────────────────────────────────────────────────
print("\n[8/8] Creating 1 stock adjustment...")

adjustment = post("/adjustments", {
    "product_id": prods[0]["id"],   # Rice 25kg
    "qty_delta":  -3,               # Found 3 less than recorded
}, headers=H, label="Create adjustment for Rice")

print(f"   • Rice 25kg: adjustment -3 (physical count correction)")
print("   ✅ Adjustment created")


# ─────────────────────────────────────────────────────────────
# DONE — Print summary
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("  🎉 SEED COMPLETE!")
print("=" * 50)
print(f"  Backend URL : {BASE}")
print(f"  Swagger docs: {BASE}/docs")
print(f"  Login email : admin@demo.com")
print(f"  Password    : demo1234")
print()
print("  What was created:")
print("    2 warehouses")
print("    4 locations  (2 per warehouse)")
print("   10 products   (2 low-stock: Butter, Cheese)")
print("    3 receipts   (validated → stock increased)")
print("    2 deliveries (validated → stock decreased)")
print("    1 transfer   (Rice: Rack A → Rack B)")
print("    1 adjustment (Rice: -3 correction)")
print()
print("  Ledger should now show 4 entry types:")
print("    Receipt / Delivery / Transfer / Adjustment")
print()
print("  Dashboard should show:")
print("    KPI cards with receipt + delivery counts")
print("    Low-stock alert for Butter (4 Pcs) + Cheese (3 KG)")
print("=" * 50)