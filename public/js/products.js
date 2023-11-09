const addToCart = (productId, productName) => {
  // TODO 9.2
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  addProductToCart(productId);
  createNotification(`Added ${productName} to cart!`, 'notifications-container');
};

(async() => {
  //TODO 9.2 
  // - get the 'products-container' element from the /products.html
  // - get the 'product-template' element from the /products.html
  // - save the response from await getJSON(url) to get all the products. getJSON(url) is available to this script in products.html, as "js/utils.js" script has been added to products.html before this script file 
  // - then, loop throug the products in the response, and for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page

  const container = document.getElementById('products-container');
  const template = document.getElementById('product-template');

  const allProducts = await getJSON('/api/products');

  for (const product of allProducts) {
    var clone = template.content.cloneNode(true);

    clone.querySelector('h3').id = `#name-${product._id}`;
    clone.querySelector('h3').textContent = product.name;
    clone.querySelector('p[class="product-description"]').textContent = product.description;
    clone.querySelector('p[class="product-price"]').textContent = product.price;

    //const button = clone.querySelector('button');
    clone.querySelector('button').addEventListener('click', function() {
      addToCart(product._id, product.name);
    });

    container.append(clone);
  }
})();