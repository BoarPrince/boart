/**
 *
 */
function scrollNavSubMenu() {
    // initial scroll to the top when starting or refreshin
    window.scroll(0, 0);

    // get intitial values, based on scroll(0, 0)
    const navSubMenuElement = document.getElementById('nav-sub-menu');
    const rect = navSubMenuElement.getBoundingClientRect();
    const origTop = rect.top;
    const origHeight = navSubMenuElement.clientHeight;
    const origScrollHeight = navSubMenuElement.scrollHeight;

    document.onscroll = () => {
        const scrollY = window.scrollY ?? 0;
        if (origHeight + scrollY > origScrollHeight) {
            // do nothing, if the nav menu is at the bottom
            return;
        }

        navSubMenuElement.style.top = origTop - scrollY + 'px';
    };
}

scrollNavSubMenu();
