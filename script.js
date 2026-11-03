const ADMIN_PASSWORD = "zap123";
let isAdminLoggedIn = false;

// Force reset cache and load fresh Vegetable Chopper with stable working image for all visitors
const STORE_VERSION = "v5_chopper_working_image";
if (localStorage.getItem("zap_store_version") !== STORE_VERSION) {
    localStorage.removeItem("zap_store_products");
    localStorage.setItem("zap_store_version", STORE_VERSION);
}

const defaultProducts = [
    {
        id: 1709400000001,
        title: "Vegetable Chopper & Onion Cutter (450 ML Handy Compact Cutter)",
        price: 239,
        originalPrice: 450,
        category: "home",
        stock: "In Stock",
        images: [
            "https://raw.githubusercontent.com/thaha77/zap_store/57c39ec94f30a75d44e9f0b5a158e3a6dcee59f5/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%281%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/57c39ec94f30a75d44e9f0b5a158e3a6dcee59f5/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%282%29.jpeg",
            "https://raw.githubusercontent.com/thaha77/zap_store/57c39ec94f30a75d44e9f0b5a158e3a6dcee59f5/WhatsApp%20Image%202026-11-03%20at%209.55.25%20PM%20%282%29.jpeg"        ],
        description: "✨ 450 ML HANDY VEGETABLE CHOPPER & ONION CUTTER ✨\n\nFeatures:\n1. Sharp stainless steel tri-blades for fast chopping.\n2. Durable food-grade plastic container (450 ML).\n3. Easy pull-cord mechanism for hassle-free operation.\n4. Perfect for onions, garlic, tomatoes, vegetables, and salads.\n\nEasy to clean and compact for everyday kitchen use."
    }
];


let products = JSON.parse(localStorage.getItem("zap_store_products")) || defaultProducts;

function saveProductsToStorage() {
    try {
        localStorage.setItem("zap_store_products", JSON.stringify(products));
    } catch (e) {
        alert("Storage full! Please delete some old products.");
    }
}

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
                    <button class="admin-edit-btn" onclick="event.stopPropagation(); editProduct(${product.id})">✏️ Edit</button>
                    <button class="admin-delete-btn" onclick="event.stopPropagation(); deleteProduct(${product.id})">🗑️ Delete</button>
                </div>
            `;
        }

        productGrid.innerHTML += `
            <div class="product-card" onclick="openProduct(${product.id})">
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
                    <button class="add-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
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
    document.getElementById("saveProductBtn").innerText = "✨ Save Product";
    addProductForm.reset();
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;

    document.getElementById("editProductId").value = product.id;
    document.getElementById("newTitle").value = product.title;
    document.getElementById("newPrice").value = product.price;
    document.getElementById("newOriginalPrice").value = product.originalPrice;
    document.getElementById("newCategory").value = product.category;
    document.getElementById("newStock").value = product.stock;
    document.getElementById("newDesc").value = product.description;

    document.getElementById("adminFormTitle").innerText = "✏️ Admin Panel: Edit Product";
    document.getElementById("saveProductBtn").innerText = "💾 Update Product";

    adminPanel.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(productId) {
    if(confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage();
        loadProducts();
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
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
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
        const oldProd = products.find(p => p.id == editId);
        if(oldProd) existingImages = oldProd.images || [];
    }

    let filesArr = [file1, file2, file3];
    let loadedImages = [];
    let totalToLoad = 0;
    let loadedCount = 0;

    filesArr.forEach(file => {
        if(file) totalToLoad++;
    });

    if(totalToLoad === 0) {
        if(editId) {
            saveFinalProduct(existingImages);
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
                    saveFinalProduct(finalArr);
                }
            });
        }
    });

    function saveFinalProduct(finalImages) {
        if(editId) {
            const index = products.findIndex(p => p.id == editId);
            if(index !== -1) {
                products[index] = {
                    id: Number(editId),
                    title,
                    price,
                    originalPrice,
                    category,
                    stock,
                    images: finalImages.length > 0 ? finalImages : existingImages,
                    description
                };
                alert("Product updated successfully!");
            }
        } else {
            const newProd = {
                id: Date.now(),
                title,
                price,
                originalPrice,
                category,
                stock,
                images: finalImages,
                description
            };
            products.unshift(newProd);
            alert("New product saved successfully!");
        }

        saveProductsToStorage();
        loadProducts();
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

function openProduct(id) {
    const p = products.find(item => item.id === id);
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
            <div class="thumbnail-row">
                ${thumbsHTML}
            </div>
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
            <button class="add-btn" style="padding: 10px 20px; font-size: 0.95rem; width:100%; margin-top: 10px;" onclick="addToCart(${p.id})">Add to Cart</button>
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

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if(product.stock === "Out of Stock") {
        alert("Sorry, this product is currently out of stock!");
        return;
    }
    const cartItem = cart.find(item => item.id === productId);

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
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#f37023; cursor:pointer; font-weight:bold;">✕</button>
            </div>
        `;
    });

    cartTotal.innerText = total;
    cartCount.innerText = count;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
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

loadProducts();