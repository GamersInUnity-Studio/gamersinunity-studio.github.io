document.addEventListener("DOMContentLoaded", function() {
    
    var menu = document.getElementById("burger");
    
    menu.addEventListener("click", toggleMenu);

    var isMenu = false; // Initial state is menu

    function toggleMenu() {
        var menu = document.getElementById("burger");
      
        // Toggle between menu and cross based on the current state
        isMenu ? menu.innerHTML = "&#10006" : menu.innerHTML = "&#9776";
        
        // Update the state for the next toggle
        isMenu = !isMenu;

        var navList = document.getElementsByClassName("primary-nav")[0];
        if (!isMenu) {
            navList.style.display = 'unset'
        }
        else{
            navList.style.display = 'none'
        }
        
    }    
});
