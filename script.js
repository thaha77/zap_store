// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCQAgqrNimf8YvKWgxR9mDS5gwea0CMZ-c",
    authDomain: "zap-store-1674c.firebaseapp.com",
    projectId: "zap-store-1674c",
    storageBucket: "zap-store-1674c.firebasestorage.app",
    messagingSenderId: "171244523263",
    appId: "1:171244523263:web:5e08ac8aa1a4603db946ca",
    measurementId: "G-GJR77GG8C3"
};

// Initialize Firebase (Compat version)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const ADMIN_PASSWORD = "black_shadow";
let isAdminLoggedIn = false;

const defaultProducts = [
    {
        id: 1709400000002,
        title: "3-in-1 Glass Oil & Vinegar Dispenser Combo (1000ml, 500ml & 250ml)",
        price: 250,
        originalPrice: 299,
        category: "home",
        stock: "In Stock",
        images: [
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.26%20PM%20%281%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.26%20PM%20%281%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-04%20at%208.21.17%20PM.jpeg"
        ],
        description: "✨ 3-IN-1 GLASS OIL & VINEGAR DISPENSER COMBO ✨\n\nUpgrade your kitchen with this stylish 3-in-1 Glass Oil & Vinegar Dispenser Combo (1000ml, 500ml, and 250ml Duck Brush Dispenser).\n\nFeatures:\n1. Leak-proof design for mess-free pouring.\n2. Premium food-grade glass construction.\n3. Sleek and modern look for your kitchen counter.\n\nPerfect for keeping your kitchen neat and organized!"
    },
    {
        id: 1709400000003,
        title: "4-in-1 Self-Care & Skincare Combo Set (Ice Roller + Scalp Massager + Facial Brushes)",
        price: 199,
        originalPrice: 250,
        category: "home",
        stock: "In Stock",
        images: [
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-04%20at%208.21.17%20PM.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.26%20PM%20%281%29.jpeg"
        ],
        description: "✨ 4-IN-1 SELF-CARE & SKINCARE COMBO SET ✨\n\nUpgrade your daily self-care routine with the ultimate Skincare & Massager Combo Set!\n\nFeatures:\n1. Silicone Ice Roller: Helps reduce face puffiness, dark circles, and tightens pores.\n2. Scalp Massager Brush: Stimulates hair growth and deeply cleanses the scalp.\n3. Facial Cleansing Brushes & Spatulas: For gentle face exfoliation and easy mask application.\n\nPremium silicone material | Washable & Reusable | Perfect for gifting!"
    },
    {
        id: 1709400000001,
        title: "Vegetable Chopper & Onion Cutter (450 ML Handy Compact Cutter)",
        price: 239,
        originalPrice: 450,
        category: "home",
        stock: "In Stock",
        images: [
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%282%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%281%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/main/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%283%29.jpeg"
        ],
        description: "✨ 450 ML HANDY VEGETABLE CHOPPER & ONION CUTTER ✨\n\nFeatures:\n1. Sharp stainless steel tri-blades for fast chopping.\n2. Durable food-grade plastic container (450 ML).\n3. Easy pull-cord mechanism for hassle-free operation.\n4. Perfect for onions, garlic, tomatoes, vegetables, and salads.\n\nEasy to clean and compact for everyday kitchen use."
    }
];

let products = [];
let cart = [];
let selectedCategory = 'all';

const productGrid = document.getElementById("productGrid");
const appView = document.getElementById("appView");
const productDetailView = document.getElementById("productDetailView");
const detailContainer = document.getElementById("detailContainer");
const adminPanel = document.getElementById("adminPanel");
const addProductForm = document.getElementById("addProductForm");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const orderForm = document.getElementById("orderForm");

// --- REAL-TIME FIREBASE SYNC ---
function initRealtimeProducts() {
    db.collection("products").onSnapshot((snapshot) => {
        let cloudProducts = [];
        snapshot.forEach((doc) => {
            cloudProducts.push({ firestoreId: doc.id, ...doc.data() });
        });

        if (cloudProducts.length === 0) {
            defaultProducts.forEach(prod => {
                db.collection("products").add(prod);
            });
        } else {
            products = cloudProducts;
            loadProducts();
        }
    });
}

function loadProducts() {
    productGrid.innerHTML = "";
    const filtered = selectedCategory === 'all' 
        ? products 
        : products.filter(p => p.category === selectedCategory);

    filtered.forEach(product => {
        const stockClass = product.stock === "Out of Stock" ? "stock-badge out" : "stock-badge";
        const mainImg = product.images && product.images.length > 0 ? product.images[0] : "";
        
        let adminButtonsHTML = "";
        if(isAdminLoggedIn) {
            adminButtonsHTML = `
                <div class="admin-controls">
                    <button class="admin-edit-btn" onclick="event.stopPropagation(); editProduct('${product.firestoreId}')">✏️ Edit</button>
                    <button class="admin-delete-btn" onclick="event.stopPropagation(); deleteProduct('${product.firestoreId}')">🗑️ Delete</button>
                </div>
            `;
        }

        productGrid.innerHTML += `
            <div class="product-card" onclick="openProduct('${product.firestoreId}')">
                <span class="${stockClass}">${product.stock}</span>
                <div class="product-img-box">
                    <img src="${mainImg}" alt="${product.title}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="price-box">
                        <span class="selling-price">₹${product.price}</span>
                        <span class="original-price">₹${product.originalPrice}</span>
                    </div>
                    <button class="add-btn" onclick="event.stopPropagation(); addToCart('${product.firestoreId}')">Add to Cart</button>
                    ${adminButtonsHTML}
                </div>
            </div>
        `;
    });
}

function openAdminPrompt() {
    if(isAdminLoggedIn) {
        resetAdminForm();
        adminPanel.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const password = prompt("Enter Admin Password:");
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        resetAdminForm();
        adminPanel.classList.remove("hidden");
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (password !== null) {
        alert("Incorrect Password!");
    }
}

function toggleAdminPanel() {
    adminPanel.classList.add("hidden");
}

function resetAdminForm() {
    document.getElementById("editProductId").value = "";
    document.getElementById("adminFormTitle").innerText = "⚡ Admin Panel: Add Product";
    document.getElementById("saveProductBtn").innerText = "✨ Save Product to Cloud";
    addProductForm.reset();
}

function editProduct(firestoreId) {
    const product = products.find(p => p.firestoreId === firestoreId);
    if(!product) return;

    document.getElementById("editProductId").value = product.firestoreId;
    document.getElementById("newTitle").value = product.title;
    document.getElementById("newPrice").value = product.price;
    document.getElementById("newOriginalPrice").value = product.originalPrice;
    document.getElementById("newCategory").value = product.category;
    document.getElementById("newStock").value = product.stock;
    document.getElementById("newDesc").value = product.description;

    document.getElementById("adminFormTitle").innerText = "✏️ Admin Panel: Edit Product";
    document.getElementById("saveProductBtn").innerText = "💾 Update Cloud Product";

    adminPanel.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(firestoreId) {
    if(confirm("Are you sure you want to delete this product from cloud?")) {
        db.collection("products").doc(firestoreId).delete().then(() => {
            alert("Product deleted successfully!");
        }).catch((error) => {
            alert("Error deleting product: " + error);
        });
    }
}

function compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const editId = document.getElementById("editProductId").value;
    const title = document.getElementById("newTitle").value;
    const price = Number(document.getElementById("newPrice").value);
    const originalPrice = Number(document.getElementById("newOriginalPrice").value);
    const category = document.getElementById("newCategory").value;
    const stock = document.getElementById("newStock").value;
    const description = document.getElementById("newDesc").value;

    const file1 = document.getElementById("imageFile1").files[0];
    const file2 = document.getElementById("imageFile2").files[0];
    const file3 = document.getElementById("imageFile3").files[0];

    let existingImages = [];
    if(editId) {
        const oldProd = products.find(p => p.firestoreId === editId);
        if(oldProd) existingImages = oldProd.images || [];
    }

    let filesArr = [file1, file2, file3];
    let loadedImages = [];
    let totalToLoad = 0;
    let loadedCount = 0;

    filesArr.forEach(file => { if(file) totalToLoad++; });

    if(totalToLoad === 0) {
        if(editId) {
            saveToCloud(editId, { title, price, originalPrice, category, stock, description, images: existingImages });
        } else {
            alert("Please select at least a main image!");
        }
        return;
    }

    filesArr.forEach((file, index) => {
        if(file) {
            compressImageFile(file, function(compressedDataUrl) {
                loadedImages[index] = compressedDataUrl;
                loadedCount++;
                if(loadedCount === totalToLoad) {
                    let finalArr = loadedImages.filter(img => img !== undefined);
                    if(editId && finalArr.length === 0) finalArr = existingImages;
                    
                    const productData = { title, price, originalPrice, category, stock, description, images: finalArr };
                    saveToCloud(editId, productData);
                }
            });
        }
    });

    function saveToCloud(id, data) {
        if(id) {
            db.collection("products").doc(id).update(data).then(() => {
                alert("Product updated in Cloud successfully!");
                finishAdminAction();
            });
        } else {
            data.id = Date.now();
            db.collection("products").add(data).then(() => {
                alert("New product added to Cloud successfully!");
                finishAdminAction();
            });
        }
    }

    function finishAdminAction() {
        resetAdminForm();
        adminPanel.classList.add("hidden");
    }
});

function filterCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadProducts();
}

function openProduct(firestoreId) {
    const p = products.find(item => item.firestoreId === firestoreId);
    appView.classList.add("hidden");
    adminPanel.classList.add("hidden");
    productDetailView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let thumbsHTML = "";
    if (p.images && p.images.length > 1) {
        p.images.forEach((img) => {
            thumbsHTML += `<img src="${img}" class="thumb-img" onclick="changeMainImage('${img}')">`;
        });
    }

    const firstImg = p.images && p.images.length > 0 ? p.images[0] : "";

    detailContainer.innerHTML = `
        <div class="detail-img-section">
            <img src="${firstImg}" id="mainDetailImg" alt="${p.title}" class="main-detail-img">
            <div class="thumbnail-row">${thumbsHTML}</div>
        </div>
        <div class="detail-info">
            <span style="font-size:0.75rem; font-weight:bold; color:${p.stock === 'In Stock' ? '#16a34a' : '#ef4444'}">${p.stock}</span>
            <h2>${p.title}</h2>
            <div class="price-box" style="margin-bottom: 12px;">
                <span class="selling-price" style="font-size: 1.4rem;">₹${p.price}</span>
                <span class="original-price" style="font-size: 1rem;">₹${p.originalPrice}</span>
            </div>
            <div class="detail-desc">
                <strong>Product Description:</strong><br><br>
                ${p.description.replace(/\n/g, '<br>')}
            </div>
            <button class="add-btn" style="padding: 10px 20px; font-size: 0.95rem; width:100%; margin-top: 10px;" onclick="addToCart('${p.firestoreId}')">Add to Cart</button>
        </div>
    `;
}

function changeMainImage(imgUrl) {
    document.getElementById("mainDetailImg").src = imgUrl;
}

function goHome() {
    productDetailView.classList.add("hidden");
    appView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addToCart(firestoreId) {
    const product = products.find(p => p.firestoreId === firestoreId);
    if(product.stock === "Out of Stock") {
        alert("Sorry, this product is currently out of stock!");
        return;
    }
    const cartItem = cart.find(item => item.firestoreId === firestoreId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, image: product.images[0] });
    }
    updateCart();
    cartDrawer.classList.add("open");
}

function updateCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.title}</strong>
                    <div>₹${item.price} x ${item.quantity}</div>
                </div>
                <button onclick="removeFromCart('${item.firestoreId}')" style="background:none; border:none; color:#f37023; cursor:pointer; font-weight:bold;">✕</button>
            </div>
        `;
    });

    cartTotal.innerText = total;
    cartCount.innerText = count;
}

function removeFromCart(firestoreId) {
    cart = cart.filter(item => item.firestoreId !== firestoreId);
    updateCart();
}

cartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    cartDrawer.classList.remove("open");
    checkoutModal.style.display = "flex";
});

closeModal.addEventListener("click", () => checkoutModal.style.display = "none");

orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const house = document.getElementById("custHouse").value;
    const area = document.getElementById("custArea").value;
    const city = document.getElementById("custCity").value;
    const state = document.getElementById("custState").value;
    const pincode = document.getElementById("custPincode").value;

    let text = "⚡ *ZAP STORE ORDER* ⚡\n\n";
    let totalPrice = 0;

    cart.forEach(item => {
        text += `▪️ ${item.title} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
        totalPrice += item.price * item.quantity;
    });

    text += `\n💰 *Total Amount: ₹${totalPrice}*\n\n`;
    text += `📍 *Delivery Address:*\n`;
    text += `Name: ${name}\nPhone: ${phone}\nAddress: ${house}, ${area}\nCity: ${city}, State: ${state}\nPincode: ${pincode}`;

    const myWhatsappNumber = "918590212065"; 
    window.open(`https://wa.me/${myWhatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
});

// Start Real-Time Cloud Sync
initRealtimeProducts();