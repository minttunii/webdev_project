const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  var newCount = decreaseProductCount(productId);
  if (newCount === 0) {
    removeElement('cart-container', productId);
  }
  else {
    updateProductAmount(productId);
  }
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  var amount = getProductCountFromCart(productId);
  document.getElementById(`amount-${productId}`).innerText = amount + "x";
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  const allInCart = getAllProductsFromCart();

  for (const prod of allInCart) {
    removeElement('cart-container', prod.name);
  }
  clearCart();

  createNotification('Successfully created an order!', 'notifications-container');
};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart 

  const container = document.getElementById('cart-container');
  const allProducts = await getJSON('/api/products');
  const productsInCart = getAllProductsFromCart();

  const template = document.getElementById('cart-item-template');

  for (const product of productsInCart) {
    let clone = template.content.cloneNode(true);

    const productInfo = allProducts.find(function(item, i){
      if(item._id === product.name){
        index = i;
        return allProducts[i];
      }
    });

    const id = productInfo._id;

    clone.querySelector('div[class="item-row"]').id = id;

    clone.querySelector('h3').id = `name-${id}`;
    clone.querySelector('h3').textContent = productInfo.name;

    clone.querySelector('p[class="product-price"]').id = `price-${id}`;
    clone.querySelector('p[class="product-price"]').textContent = productInfo.price;

    clone.querySelector('p[class="product-amount"]').id = `amount-${id}`;
    clone.querySelector('p[class="product-amount"]').textContent = product.amount + "x";

    const buttons = clone.querySelectorAll('button[class=cart-minus-plus-button]');
    buttons[0].id = `plus-${id}`;
    buttons[1].id = `minus-${id}`;

    buttons[0].addEventListener('click', function() {
      addToCart(id);
    });

    buttons[1].addEventListener('click', function() {
      decreaseCount(id);
    });

    container.append(clone);
  }

  document.getElementById('place-order-button').addEventListener('click', function(){
    placeOrder();
  })

})();