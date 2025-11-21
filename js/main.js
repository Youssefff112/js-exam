// Global Variables
let rowData;
let searchContainer;
let submitBtn;

// Side Nav Functions
function openSideNav() {
    $(".side-nav-menu").animate({ left: 0 }, 500);
    $(".open-close-icon").removeClass("fa-align-justify");
    $(".open-close-icon").addClass("fa-x");
    
    for (let i = 0; i < $(".links li").length; i++) {
        $(".links li").eq(i).animate({ top: 0 }, (i + 5) * 100);
    }
}

function closeSideNav() {
    let boxWidth = $(".side-nav-menu .nav-tab").outerWidth();
    $(".side-nav-menu").animate({ left: -boxWidth }, 500);
    $(".open-close-icon").addClass("fa-align-justify");
    $(".open-close-icon").removeClass("fa-x");
    
    $(".links li").animate({ top: 300 }, 500);
}

// Initialize when document is ready
$(document).ready(async function () {
    // Initialize DOM elements
    rowData = document.getElementById("rowData");
    searchContainer = document.getElementById("searchContainer");
    
    // Setup open-close-icon click handler ONLY
    $(document).on("click", ".open-close-icon", function () {
        if ($(".side-nav-menu").css("left") == "0px") {
            closeSideNav();
        } else {
            openSideNav();
        }
    });
    
    closeSideNav();
    
    // Load initial categories
    try {
        console.log("Starting to load initial categories...");
        $(".loading-screen").css("display", "flex");
        await getCategories();
        console.log("Categories loaded successfully");
        $(".loading-screen").fadeOut(300, function() {
            $(".loading-screen").css("display", "none");
            $("body").css("overflow", "visible");
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        $(".loading-screen").fadeOut(300, function() {
            $(".loading-screen").css("display", "none");
            $("body").css("overflow", "visible");
        });
    }
});

// Display Functions
function displayMeals(arr) {
    let cartoona = "";
    
    if (arr.length === 0) {
        rowData.innerHTML = `<div class="col-12 text-center py-5"><h3>No meals found. Try another search!</h3></div>`;
        return;
    }
    
    for (let i = 0; i < arr.length; i++) {
        cartoona += `
        <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 cursor-pointer" data-meal-id="${arr[i].idMeal}" style="cursor: pointer;">
                    <img class="w-100" src="${arr[i].strMealThumb}" alt="${arr[i].strMeal}" style="height: 250px; object-fit: cover;">
                    <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                        <h3>${arr[i].strMeal}</h3>
                    </div>
                </div>
        </div>
        `;
    }
    
    rowData.innerHTML = cartoona;
    
    // Add event listeners to meal cards
    document.querySelectorAll(".meal").forEach(meal => {
        meal.addEventListener("click", function() {
            const mealId = this.getAttribute("data-meal-id");
            getMealDetails(mealId);
        });
    });
}

function displayCategories(arr) {
    let cartoona = "";
    
    for (let i = 0; i < arr.length; i++) {
        cartoona += `
        <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 cursor-pointer" data-category="${arr[i].strCategory}">
                    <img class="w-100" src="${arr[i].strCategoryThumb}" alt="" srcset="">
                    <div class="meal-layer position-absolute text-center text-black p-2">
                        <h3>${arr[i].strCategory}</h3>
                        <p>${arr[i].strCategoryDescription.split(" ").slice(0, 20).join(" ")}</p>
                    </div>
                </div>
        </div>
        `;
    }
    
    rowData.innerHTML = cartoona;
    
    // Add event listeners to category cards
    document.querySelectorAll(".meal").forEach(category => {
        category.addEventListener("click", function() {
            const categoryName = this.getAttribute("data-category");
            getCategoryMeals(categoryName);
        });
    });
}

function displayArea(arr) {
    let cartoona = "";
    
    for (let i = 0; i < arr.length; i++) {
        cartoona += `
        <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 cursor-pointer text-center" data-area="${arr[i].strArea}">
                        <i class="fa-solid fa-house-laptop fa-4x"></i>
                        <h3>${arr[i].strArea}</h3>
                </div>
        </div>
        `;
    }
    
    rowData.innerHTML = cartoona;
    
    // Add event listeners to area cards
    document.querySelectorAll(".meal").forEach(area => {
        area.addEventListener("click", function() {
            const areaName = this.getAttribute("data-area");
            getAreaMeals(areaName);
        });
    });
}

function displayIngredients(arr) {
    let cartoona = "";
    
    for (let i = 0; i < arr.length; i++) {
        const ingredientName = arr[i].strIngredient;
        const ingredientImage = `https://www.themealdb.com/images/ingredients/${ingredientName}-small.png`;
        
        cartoona += `
        <div class="col-md-3">
                <div class="meal position-relative overflow-hidden rounded-2 cursor-pointer text-center" style="min-height: 250px;" data-ingredient="${ingredientName}">
                        <img class="w-100" src="${ingredientImage}" alt="${ingredientName}" style="height: 250px; object-fit: contain; padding: 10px; background: white;" onerror="this.src='https://via.placeholder.com/150?text=${ingredientName}'">
                        <div class="meal-layer position-absolute d-flex flex-column justify-content-center align-items-center text-black p-3">
                            <h3>${ingredientName}</h3>
                            <p style="font-size: 0.85rem; line-height: 1.4;">${arr[i].strDescription ? arr[i].strDescription.split(" ").slice(0, 12).join(" ") : "Click to see meals"}</p>
                        </div>
                </div>
        </div>
        `;
    }
    
    rowData.innerHTML = cartoona;
    
    // Add event listeners to ingredient cards
    document.querySelectorAll(".meal").forEach(ingredient => {
        ingredient.addEventListener("click", function() {
            const ingredientName = this.getAttribute("data-ingredient");
            getIngredientsMeals(ingredientName);
        });
    });
}

function displayMealDetails(meal) {
    searchContainer.innerHTML = "";
    
    let ingredients = ``;
    
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<span class="recipe-item">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</span>`;
        }
    }
    
    let tags = meal.strTags ? meal.strTags.split(",") : [];
    let tagsStr = '';
    for (let i = 0; i < tags.length; i++) {
        tagsStr += `<a href="#" class="tag-btn source" onclick="return false">${tags[i].trim()}</a>`;
    }
    
    let cartoona = `
    <div class="meal-details">
        <div class="container">
            <div class="meal-header">
                <div class="meal-image">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid rounded">
                    <h2 class="text-white mt-3">${meal.strMeal}</h2>
                </div>
                <div class="meal-info">
                    <h2>Instructions</h2>
                    <div class="instructions">
                        ${meal.strInstructions}
                    </div>
                    
                    <div class="area-category">
                        <div>
                            <strong>Area :</strong> ${meal.strArea}
                        </div>
                        <div>
                            <strong>Category :</strong> ${meal.strCategory}
                        </div>
                    </div>
                    
                    <h3>Recipes :</h3>
                    <div class="recipes-container">
                        ${ingredients}
                    </div>
                    
                    <h3>Tags :</h3>
                    <div class="tags-container">
                        ${tagsStr}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <a target="_blank" href="${meal.strSource}" class="tag-btn source">Source</a>
                        <a target="_blank" href="${meal.strYoutube}" class="tag-btn youtube">Youtube</a>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    rowData.innerHTML = cartoona;
}

// API Calls
async function getCategories() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";
    
    try {
        console.log("Fetching categories...");
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.categories) {
            console.log(`Found ${response.categories.length} categories`);
            displayCategories(response.categories);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getArea() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";
    
    try {
        console.log("Fetching areas...");
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} areas`);
            displayArea(response.meals);
        }
    } catch (error) {
        console.error("Error fetching areas:", error);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getIngredients() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";
    
    try {
        console.log("Fetching ingredients...");
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} ingredients`);
            displayIngredients(response.meals.slice(0, 20));
        }
    } catch (error) {
        console.error("Error fetching ingredients:", error);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getCategoryMeals(category) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    
    try {
        console.log(`Fetching meals for category: ${category}`);
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} meals`);
            displayMeals(response.meals.slice(0, 20));
        } else {
            displayMeals([]);
        }
    } catch (error) {
        console.error("Error fetching category meals:", error);
        displayMeals([]);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getAreaMeals(area) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    
    try {
        console.log(`Fetching meals for area: ${area}`);
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} meals`);
            displayMeals(response.meals.slice(0, 20));
        } else {
            displayMeals([]);
        }
    } catch (error) {
        console.error("Error fetching area meals:", error);
        displayMeals([]);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getIngredientsMeals(ingredients) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    
    try {
        console.log(`Fetching meals for ingredient: ${ingredients}`);
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredients}`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} meals`);
            displayMeals(response.meals.slice(0, 20));
        } else {
            displayMeals([]);
        }
    } catch (error) {
        console.error("Error fetching ingredient meals:", error);
        displayMeals([]);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getMealDetails(mealID) {
    closeSideNav();
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";
    
    try {
        console.log(`Fetching meal details for ID: ${mealID}`);
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals && response.meals.length > 0) {
            displayMealDetails(response.meals[0]);
        }
    } catch (error) {
        console.error("Error fetching meal details:", error);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function searchByName(term, showLoader = true) {
    closeSideNav();
    if (rowData) rowData.innerHTML = "";
    if (showLoader) {
        $(".inner-loading-screen").fadeIn(300);
    }
    
    try {
        console.log(`Fetching meals with term: "${term}"`);
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        console.log(`Response status: ${response.status}`);
        response = await response.json();
        console.log(`Response data:`, response);
        
        if (response.meals) {
            console.log(`Found ${response.meals.length} meals`);
            displayMeals(response.meals.slice(0, 20));
        } else {
            console.log("No meals found in response");
            displayMeals([]);
        }
    } catch (error) {
        console.error("Error in searchByName:", error);
        displayMeals([]);
    }
    
    if (showLoader) {
        $(".inner-loading-screen").fadeOut(300);
    }
}

async function searchByFirstLetter(letter) {
    closeSideNav();
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    
    if (letter == "") {
        letter = "a";
    }
    
    let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    response = await response.json();
    
    if (response.meals) {
        displayMeals(response.meals.slice(0, 20));
    } else {
        displayMeals([]);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

async function getRandomMeal() {
    closeSideNav();
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";
    
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
        response = await response.json();
        
        if (response.meals && response.meals.length > 0) {
            displayMealDetails(response.meals[0]);
        }
    } catch (error) {
        console.error("Error fetching random meal:", error);
    }
    
    $(".inner-loading-screen").fadeOut(300);
}

// Search Inputs
function showSearchInputs() {
    searchContainer.innerHTML = `
    <div class="row py-4">
        <div class="col-md-6">
            <input id="searchByNameInput" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
            <input id="searchByLetterInput" maxlength="1" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
        </div>
    </div>`;
    
    rowData.innerHTML = "";
    
    // Add event listeners for search inputs
    document.getElementById("searchByNameInput").addEventListener("keyup", function(e) {
        searchByName(this.value);
    });
    
    document.getElementById("searchByLetterInput").addEventListener("keyup", function(e) {
        searchByFirstLetter(this.value);
    });
}

// Contact Form
function showContacts() {
    rowData.innerHTML = `<div class="contact min-vh-100 d-flex justify-content-center align-items-center">
    <div class="container w-75 text-center">
        <div class="row g-4">
            <div class="col-md-6">
                <input id="nameInput" type="text" class="form-control" placeholder="Enter Your Name">
                <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Special characters and numbers not allowed
                </div>
            </div>
            <div class="col-md-6">
                <input id="emailInput" type="email" class="form-control " placeholder="Enter Your Email">
                <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Email not valid *exemple@yyy.zzz
                </div>
            </div>
            <div class="col-md-6">
                <input id="phoneInput" type="text" class="form-control " placeholder="Enter Your Phone">
                <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid Phone Number
                </div>
            </div>
            <div class="col-md-6">
                <input id="ageInput" type="number" class="form-control " placeholder="Enter Your Age">
                <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid age
                </div>
            </div>
            <div class="col-md-6">
                <input  id="passwordInput" type="password" class="form-control " placeholder="Enter Your Password">
                <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid password *Minimum eight characters, at least one letter and one number:*
                </div>
            </div>
            <div class="col-md-6">
                <input  id="repasswordInput" type="password" class="form-control " placeholder="Repassword">
                <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid repassword 
                </div>
            </div>
        </div>
        <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
    </div>
</div> `;
    submitBtn = document.getElementById("submitBtn");
    
    // Add keyup event listeners to form inputs
    document.getElementById("nameInput").addEventListener("keyup", inputsValidation);
    document.getElementById("emailInput").addEventListener("keyup", inputsValidation);
    document.getElementById("phoneInput").addEventListener("keyup", inputsValidation);
    document.getElementById("ageInput").addEventListener("keyup", inputsValidation);
    document.getElementById("passwordInput").addEventListener("keyup", inputsValidation);
    document.getElementById("repasswordInput").addEventListener("keyup", inputsValidation);
    
    document.getElementById("nameInput").addEventListener("focus", () => {
        nameInputTouched = true;
    });
    
    document.getElementById("emailInput").addEventListener("focus", () => {
        emailInputTouched = true;
    });
    
    document.getElementById("phoneInput").addEventListener("focus", () => {
        phoneInputTouched = true;
    });
    
    document.getElementById("ageInput").addEventListener("focus", () => {
        ageInputTouched = true;
    });
    
    document.getElementById("passwordInput").addEventListener("focus", () => {
        passwordInputTouched = true;
    });
    
    document.getElementById("repasswordInput").addEventListener("focus", () => {
        repasswordInputTouched = true;
    });
}

let nameInputTouched = false;
let emailInputTouched = false;
let phoneInputTouched = false;
let ageInputTouched = false;
let passwordInputTouched = false;
let repasswordInputTouched = false;

function inputsValidation() {
    if (nameInputTouched) {
        if (nameValidation()) {
            document.getElementById("nameAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("nameAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (emailInputTouched) {
        if (emailValidation()) {
            document.getElementById("emailAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("emailAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (phoneInputTouched) {
        if (phoneValidation()) {
            document.getElementById("phoneAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("phoneAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (ageInputTouched) {
        if (ageValidation()) {
            document.getElementById("ageAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("ageAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (passwordInputTouched) {
        if (passwordValidation()) {
            document.getElementById("passwordAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("passwordAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (repasswordInputTouched) {
        if (repasswordValidation()) {
            document.getElementById("repasswordAlert").classList.replace("d-block", "d-none");
        } else {
            document.getElementById("repasswordAlert").classList.replace("d-none", "d-block");
        }
    }
    
    if (nameValidation() &&
        emailValidation() &&
        phoneValidation() &&
        ageValidation() &&
        passwordValidation() &&
        repasswordValidation()) {
        submitBtn.removeAttribute("disabled");
    } else {
        submitBtn.setAttribute("disabled", true);
    }
}

function nameValidation() {
    return (/^[a-zA-Z ]+$/.test(document.getElementById("nameInput").value));
}

function emailValidation() {
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(document.getElementById("emailInput").value));
}

function phoneValidation() {
    return (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(document.getElementById("phoneInput").value));
}

function ageValidation() {
    return (/^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/.test(document.getElementById("ageInput").value));
}

function passwordValidation() {
    return (/^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test(document.getElementById("passwordInput").value));
}

function repasswordValidation() {
    return document.getElementById("repasswordInput").value == document.getElementById("passwordInput").value;
}