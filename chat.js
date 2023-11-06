
/**
 * ==============================================
 * vars and elements
 * ==============================================
 */
    var messageInput = document.getElementById('dy-muse-message-input-field');
    var sendMessageButton = document.getElementById('dy-muse-message-input-btn');
    var chat =  document.getElementById('dy-muse-chat-wrapper');
    var openChat = document.getElementById('open-chat');
    var closeChat = document.getElementById('dy-muse-header-close');
    var overlay = document.getElementById('dy-muse-chat-overlay');
    var suggestionsList = document.querySelector(".dy-muse-suggestions-list");
    var startAgainBtn = document.querySelector('.dy-muse-header-restart-btn');
    var counter = document.querySelector('.dy-muse-message-input-counter');
    var messagesList = document.querySelector('.dy-muse-message-list');
    var image = document.querySelector('.dy-muse-message-gallery-item-image')
    var ABOUT_TO_REACH_MAX_CHARTS = 49;
    var MAX_CHARTS_LIMIT = 70;
    var TIME_TO_LOADER = 3000;
    var INPUT_LINE_HEIGHT = 44;
    var GALLERY_COUNTER = 0
    var WELCOME_MESSAGE = 'Hey there 👋 I’m here to help you find what you need. Here are some recommendations to help get going:';
    var ERROR_MESSAGE = 'Sorry, you used a character that confuses me. Try again without special characters';
    var IS_LOADING = false;
    var IS_MESSAGE_SENT = false;
    var container = messageInput.parentElement;
    var previousHeight = messageInput.scrollHeight;
    // var galleryTemplate = 

/**
 * ==============================================
 * event listeners 
 * ==============================================
 */
// event listener to open chat button. will be triger by the customer
openChat.addEventListener('click', function () {
    openDyChat();
    //TODO add localstorage check
});
// event listener to the gary background
overlay.addEventListener('click', function () {
    closeChatHandler();
});
// event listener to the closing chat button
closeChat.addEventListener('click', function () {
    closeChatHandler();
});

// event listener to the send button
sendMessageButton.addEventListener('click', function () {
    onMessageSent(messageInput.value);
});

// event listener to the input field for the Enter key
messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        onMessageSent(messageInput.value);
    }
});
// event listener to the restart button
startAgainBtn.addEventListener('click', function () {
    clearChat(messagesList);
});

suggestionsList.addEventListener('click', function (e) {
    if (e.target && e.target.tagName === 'LI') {
        const clickedItemText = e.target.textContent;
        onMessageSent(clickedItemText);
    }
});

// event listener to the input field for changes
messageInput.addEventListener('input', function () {
    handleInputLineHeight();
    handleInputCounter();
});

/**
 * ==============================================
 * functions
 * ==============================================
 */

function openDyChat() {
    overlay.classList.remove('hidden');
        chat.style.display = 'flex';
        setTimeout(function () {
            chat.style.transform = 'translateX(0)'; // Slide the popup in from the right
        }, 200); 
        initChatData()
}

async function initChatData() {
    console.log('init chat')
    clearChat(messagesList);
    await createSuggestions()
    startLoader()
    const response = await simulateFetch()
        if(response){
            sendServerMessagesToChat(response)
            
        }else{
            stopLoader();
            console.error(error);
        }
 
}
function createSuggestions() {
    const suggestions = [
    "What to wear for a summer wedding?",
    "How to build a minimalist capsule?",
    "How to dress like Rihanna?",
    "Do you have anything like the shirt in this image?",
    "What is on your mind?"
];
suggestions.forEach((suggestionText) => {
    const li = document.createElement("li");
    li.className = "dy-muse-suggestions-item";
    li.textContent = suggestionText;
    suggestionsList.appendChild(li);

});

}

function closeChatHandler() {
    overlay.classList.add('hidden');
    chat.style.transform = 'translateX(100%)'; // Slide the popup out to the right
    setTimeout(function () {
        chat.style.display = 'none';
    }, 300);
}

function handleInputCounter() {
    const messageText = messageInput.value;
    if (messageText.length > ABOUT_TO_REACH_MAX_CHARTS) {
        if (messageText.length > MAX_CHARTS_LIMIT) {
        // Truncate the text to the maximum length

            counter.textContent = `${MAX_CHARTS_LIMIT}/${MAX_CHARTS_LIMIT}`
        } else{
            counter.textContent = `${messageText.length}/${MAX_CHARTS_LIMIT}`
        }
    } else if(counter.textContent) {
        counter.textContent = '';
    }
}
async function onMessageSent(messageText) {
    // Get the message text from the input field
    if (IS_LOADING) return
    if (messageText && isValidMessage(messageText)) {
        sendClientMessageToChat(messageText)
        const response = await simulateFetch(messageText)
        if(response){
            sendServerMessagesToChat(response)
        }

    }
    messageInput.value = '';   
}

function sendClientMessageToChat(messageText) {
        var li = document.createElement('li');
        li.classList.add('dy-muse-message-item', 'right');
        li.innerHTML = `<div class="dy-muse-user-msg">
                    <p class="dy-muse-user-msg-text">${messageText}</p>
                  </div>`
        messagesList.appendChild(li);
        setTimeout(startLoader, 500);
        if(!IS_MESSAGE_SENT) { 
            showStartAgain()
            IS_MESSAGE_SENT = true
        }
        console.log('Message Sent:', messageText) ;
}

function sendServerMessagesToChat(result) {
    const {title, products} = result
// imageUrl name price sku

    // Iterate through each product in the array
    if(products){
        createGalleryContainer(products.length);
        createGalleryItems(products);    
        console.log('finish adding to doc')
}
};

function createGalleryContainer(productsLength) {
    var li = document.createElement('li');
    li.classList.add('dy-muse-message-item', 'left', 'gallery', 'hidden');
    li.setAttribute('data-gallery-id', GALLERY_COUNTER);
    // create gallery panel
    li.innerHTML = `
        <div class="dy-muse-message-gallery" data-gallery-id="${GALLERY_COUNTER}">
            <div class="dy-muse-message-gallery-title">Recently Viewed</div>
            <div class="dy-muse-message-gallery-btn prev" data-gallery-id="${GALLERY_COUNTER}">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class="dy-prev" fill="white" d="M1.13104 9.34682L9.1026 4.3646C9.45386 4.14506 9.91657 4.25184 10.1361 4.6031C10.3556 4.95435 10.2489 5.41706 9.8976 5.63659L5.0028 8.69585C4.7472 8.85559 4.86039 9.25025 5.1618 9.25025L19.5001 9.25025C19.9143 9.25025 20.2501 9.58603 20.2501 10.0002C20.2501 10.4145 19.9143 10.7502 19.5001 10.7502L5.1618 10.7502C4.86039 10.7502 4.7472 11.1449 5.0028 11.3046L9.8976 14.3639C10.2489 14.5834 10.3556 15.0461 10.1361 15.3974C9.91657 15.7487 9.45386 15.8554 9.1026 15.6359L1.13104 10.6537C1.02547 10.5941 0.93286 10.5081 0.864104 10.3981C0.786843 10.2745 0.749999 10.1371 0.750003 10.0013C0.749621 9.86484 0.786449 9.72665 0.864104 9.6024C0.93286 9.49239 1.02547 9.40636 1.13104 9.34682Z" />
                </svg>

            </div>
            <ul class="dy-muse-message-gallery-container" data-gallery-id="${GALLERY_COUNTER}"></ul>
            <div class="dy-muse-message-gallery-btn next" data-gallery-id="${GALLERY_COUNTER}">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class="dy-next" fill="white" d="M19.8691 9.34633L11.8975 4.3641C11.5462 4.14457 11.0835 4.25135 10.864 4.6026C10.6445 4.95385 10.7512 5.41657 11.1025 5.6361L15.9973 8.69535C16.2529 8.8551 16.1397 9.24975 15.8383 9.24975H1.5C1.08579 9.24975 0.75 9.58554 0.75 9.99975C0.75 10.414 1.08579 10.7498 1.5 10.7498H15.8383C16.1397 10.7498 16.2529 11.1444 15.9973 11.3042L11.1025 14.3634C10.7512 14.5829 10.6445 15.0457 10.864 15.3969C11.0835 15.7482 11.5462 15.8549 11.8975 15.6354L19.8691 10.6532C19.9746 10.5936 20.0672 10.5076 20.136 10.3976C20.2133 10.274 20.2501 10.1366 20.2501 10.0008C20.2505 9.86435 20.2137 9.72615 20.136 9.6019C20.0672 9.49189 19.9746 9.40586 19.8691 9.34633Z" />
                    </svg>
                </div>
        </div>`;

    var galleryContainer = li.querySelector(`.dy-muse-message-gallery-container[data-gallery-id="${GALLERY_COUNTER}"]`);

    var next = li.querySelector(`.dy-muse-message-gallery-btn.next[data-gallery-id="${GALLERY_COUNTER}"]`);
    var prev = li.querySelector(`.dy-muse-message-gallery-btn.prev[data-gallery-id="${GALLERY_COUNTER}"]`);

    // Function to toggle the visibility of the next and prev buttons
    function toggleButtonsVisibility() {
        prev.style.display = (galleryContainer.scrollLeft > 0) ? 'flex' : 'none';
        next.style.display = (galleryContainer.scrollWidth - galleryContainer.scrollLeft === galleryContainer.clientWidth) ? 'none' : 'flex';
    }
    prev.style.display = 'none';
    if(productsLength > 4){
        // Add event listener for scrolling
        galleryContainer.addEventListener('scroll', function () {
            toggleButtonsVisibility();
        });

        next.addEventListener('click', function (e) {
            galleryContainer.style.scrollBehavior = "smooth";
            galleryContainer.scrollLeft +=900;
        })
        prev.addEventListener('click', function (e) {
            galleryContainer.style.scrollBehavior = "smooth";
            galleryContainer.scrollLeft -=900;
        })
    }else{
        next.style.display = 'none';
    }

    messagesList.appendChild(li);
}

function createGalleryItems(products){
// Iterate through each product and create gallery items
    var galleryContainer = document.querySelector(`.dy-muse-message-gallery-container[data-gallery-id="${GALLERY_COUNTER}"]`);
    products.forEach(function (product) {
        var galleryItem = document.createElement('li');
        // var bgColor = getComputedStyle(sendMessageButton).backgroundColor
        galleryItem.classList.add('dy-muse-message-gallery-item');
        galleryItem.innerHTML = `
            <div class="dy-muse-message-gallery-item-image">
                <img height="202" width="158px" src="${product.imageUrl}" data-url="${product.link}" />
                    <div class="dy-muse-show-similiar-container">
                        <svg class="dy-muse-show-similiar-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="dy-muse-show-similiar-path" fill-rule="evenodd" clip-rule="evenodd" d="M2.75 3C2.75 1.48122 3.98122 0.25 5.5 0.25H9.5C11.0188 0.25 12.25 1.48122 12.25 3V3.25H12.5C14.0188 3.25 15.25 4.48122 15.25 6V6.25H15.5C17.0188 6.25 18.25 7.48122 18.25 9V17C18.25 18.5188 17.0188 19.75 15.5 19.75H11.5C9.98122 19.75 8.75 18.5188 8.75 17V16.75H8.5C6.98122 16.75 5.75 15.5188 5.75 14V13.75H5.5C3.98122 13.75 2.75 12.5188 2.75 11V3ZM10.25 16.75V17C10.25 17.6904 10.8096 18.25 11.5 18.25H15.5C16.1904 18.25 16.75 17.6904 16.75 17V9C16.75 8.30964 16.1904 7.75 15.5 7.75H15.25V14C15.25 15.5188 14.0188 16.75 12.5 16.75H10.25ZM13.75 6C13.75 5.30964 13.1904 4.75 12.5 4.75H12.25V11C12.25 12.5188 11.0188 13.75 9.5 13.75H7.25V14C7.25 14.6904 7.80964 15.25 8.5 15.25H12.5C13.1904 15.25 13.75 14.6904 13.75 14V6ZM10.75 3V11C10.75 11.6904 10.1904 12.25 9.5 12.25H5.5C4.80964 12.25 4.25 11.6904 4.25 11V3C4.25 2.30964 4.80964 1.75 5.5 1.75H9.5C10.1904 1.75 10.75 2.30964 10.75 3Z" 
                            fill="white"/>
                        </svg>
                        <label class="dy-muse-show-similiar-text">Show Similiar</label>
                    </div>
                </div>
            <div class="dy-muse-message-gallery-item-name">${product.name}</div>
            <div class="dy-muse-message-gallery-item-price">${product.price}</div>
        `;

        var showSimiliar = galleryItem.querySelector('.dy-muse-show-similiar-container')
        showSimiliar.addEventListener('click', function () {
            onMessageSent(`Show similar items to "${product.name}"`)


        });

         // Select the image element inside the gallery item
            var image = galleryItem.querySelector('.dy-muse-message-gallery-item-image img');
            var imageURL = image.getAttribute('data-url');
        // Add a click event listener to the image
        image.addEventListener('click', function (e) {
            console.log(e);
            console.log(image);
            window.open(imageURL, '_blank');
        });
        galleryContainer.appendChild(galleryItem);
    });

    var images = document.querySelectorAll(`.dy-muse-message-gallery-container[data-gallery-id="${GALLERY_COUNTER}"] img`);
    // var imgGallery = document.querySelector(`.dy-muse-message-item.left.gallery[data-gallery-id="${GALLERY_COUNTER}"]`);


    if (checkImagesLoaded(images)) {
        onAllImagesLoaded();
        } else {
        // If not all images are loaded, add a load event listener to each image
        for (const image of images) {
            image.addEventListener('load', () => {
            if (checkImagesLoaded(images)) {
                onAllImagesLoaded();
            }
            });
        }
        }

    // firstImageToLoad.addEventListener('load', function() {
    //     stopLoader();
    //     imgGallery.classList.remove('hidden');
    // });

    
}

// function addItemToList(template, listEl, classes) {
//     var li = document.createElement('li');
//     if(classes){
//         classes.forEach(className => {
//             li.classList.add(className);
//         });
//     }
//         li.innerHTML = template
//         listEl.appendChild(li);

// }

function isValidMessage(messageText) {
    return true
}

function showStartAgain() {
    startAgainBtn.classList.remove('hidden');
}

// Function to add the flashing dot item
function startLoader() {
  const li = document.createElement('li');
  li.classList.add('dy-muse-loader');
  li.innerHTML = `
    <div class="dy-muse-dot-flashing">
      <div class="dot-flashing"></div>
    </div>
  `;
  messagesList.appendChild(li);
  IS_LOADING = true;
}

function stopLoader() {
//   loaderActive = false;
  IS_LOADING = false;
  var dotFlashing = document.querySelector('.dy-muse-loader');
  if (dotFlashing) {
    messagesList.removeChild(dotFlashing); // Remove the loader if it's present
  }
}

function clearChat(parentElement) {

    const childrenToRemove = Array.from(parentElement.children);
    childrenToRemove.shift();

// Reduce opacity and set display to none for children to be removed
childrenToRemove.forEach(child => {
  child.style.opacity = 0;
  child.style.pointerEvents = "none";
});
setTimeout(() => {
    childrenToRemove.forEach(child => messagesList.removeChild(child));
  }, 100);
}

const simulateFetch = (msg) => {
  return new Promise((resolve, reject) => {
    // Simulate a delay (e.g., 1 second) to mimic a real request
    setTimeout(() => {

      const data = {
    "status": "success",
    "info": {
        "role": "assistant",
        "rawContent": "{\"assistant\": \"Let's find pieces inspired by Rihanna's style!\",\n\"queries\": [{\n\"query\": \"Oversized denim jacket\",\n\"queryTitle\": \"Denim Cool\"},\n{\n\"query\": \"Graphic print t-shirt\",\n\"queryTitle\": \"Graphic Edge\"},\n{\n\"query\": \"High waist ripped jeans\",\n\"queryTitle\": \"Ripped Chic\"}]}",
        "content": {
            "queries": [
                {
                    "query": "Oversized denim jacket",
                    "queryTitle": "Denim Cool"
                },
                {
                    "query": "Graphic print t-shirt",
                    "queryTitle": "Graphic Edge"
                },
                {
                    "query": "High waist ripped jeans",
                    "queryTitle": "Ripped Chic"
                }
            ],
            "text": "Let's find pieces inspired by Rihanna's style!"
        },
        "display": true,
        "chatCompletion": true,
        "recommendWidgets": [
            {
                "title": "Denim Cool",
                "products": [
                    {
                        "imageUrl": "https://static.sinsay.com/pl/pl/media/catalog/product/U/V/UV990-05J-201_1.jpg?impolicy=product",
                        "price": 39.99,
                        "name": "Kurtka jeansowa",
                        "link": "http://http://www.google.com",
                        "sku": "UV990-05J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/media/catalog/product/3/3/3369B-50J-001-1-507971_4.jpg?impolicy=product",
                        "price": 79.99,
                        "name": "Jeansy straight low waist",
                        "link": "http://www.google.com",
                        "sku": "3369B-50J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/pl/pl/media/catalog/product/U/V/UV990-55J-201_1.jpg?impolicy=product",
                        "price": 39.99,
                        "name": "Kurtka jeansowa",
                        "link": "http://www.google.com",
                        "sku": "UV990-55J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/media/catalog/product/9/6/9698A-50J-010-1.jpg?impolicy=product",
                        "price": 49.99,
                        "name": "Kurtka jeansowa",
                        "link": "http://www.google.com",
                        "sku": "9698A-50J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/pl/pl/media/catalog/product/V/Z/VZ198-55J-201_1.jpg?impolicy=product",
                        "price": 79.99,
                        "name": "Jeansowa kurtka",
                        "link": "http://www.google.com",
                        "sku": "VZ198-55J-L"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/media/catalog/product/5/9/5990J-50J-003-1_8.jpg?impolicy=product",
                        "price": 69.99,
                        "name": "Kurtka jeansowa",
                        "link": "http://www.google.com",
                        "sku": "5990J-50J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/media/catalog/product/1/2/1278F-55J-001-1-352727_6.jpg?impolicy=product",
                        "price": 69.99,
                        "name": "Kurtka jeansowa",
                        "link": "http://www.google.com",
                        "sku": "1278F-55J"
                    },
                    {
                        "imageUrl": "https://static.sinsay.com/media/catalog/product/6/0/6020J-55J-001-1-456127_2.jpg?impolicy=product",
                        "price": 29.99,
                        "name": "Szorty jeansowe high waist",
                        "link": "http://www.google.com",
                        "sku": "6020J-55J"
                    }
                ]
            } ]
    }
}
      resolve(data['info']['recommendWidgets'][0]); // Resolve the Promise with the data
    }, 1000);
  });
};


function sendClientMessageToServer(){
    simulateFetch()
  .then(responseData => {
    var data = responseData['info']['recommendWidgets']
    //console.log(data); // Process the response data
    return data
  })
  .catch(error => {
    console.error(error); // Handle any errors
  });
}

function handleInputLineHeight() {
 // Set a minimum height when content is empty
 if (messageInput.value === '') {
        messageInput.style.height = `${INPUT_LINE_HEIGHT}px`; 
        container.style.height = messageInput.style.height;
        return
  }
  // Set the height to the scrollHeight
  messageInput.style.height = Math.max(messageInput.scrollHeight, INPUT_LINE_HEIGHT) + 'px'; 
  // Check if the height has changed
  if (previousHeight !== messageInput.scrollHeight) {
    // Adjust the container's height to match the textarea's height
    container.style.height =  messageInput.style.height;
  }
  // Update the previousHeight for the next input event
  previousHeight = messageInput.scrollHeight;
}

function checkImagesLoaded(images) {
  for (const image of images) {
    if (!image.complete) {
      return false;
    }
  }
  return true;
}

// Function to perform an action when all images are loaded
function onAllImagesLoaded() {
  console.log('All images have loaded');
  stopLoader();
  var imgGallery = document.querySelector(`.dy-muse-message-item.left.gallery[data-gallery-id="${GALLERY_COUNTER}"]`);
imgGallery.classList.remove('hidden');
GALLERY_COUNTER++
  // Your code to do something after all images are loaded
}
