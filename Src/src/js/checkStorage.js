App.controller('checkStorage', function (page) {
    if (typeof (localStorage) === 'undefined') {
        $(page).find(".js-storage-alert").removeClass("hidden");
    } else {
        console.log("rerouting to Home")
        App.load('home');
    }
});