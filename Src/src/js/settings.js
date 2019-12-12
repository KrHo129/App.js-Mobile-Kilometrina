(function () {

    function deleteStorage(e) {

        const chkBoxes = $(".js-delete-storage-chkbox");
        const deleteStorageKeys = [];
        for (let i = 0; i < chkBoxes.length; i++) {
            const chkBox = chkBoxes[i];
            if (chkBox.checked) {
                deleteStorageKeys.push(chkBox.getAttribute("storage"))
            }
        }

        if (deleteStorageKeys.length > 0) {
            App.dialog({
                title: 'Pozor!',
                text: ('Ali ste prepričani, da želite izbrisati označene podatke?'),
                okButton: 'Nadaljuj',
                cancelButton: 'Prekliči'
            }, function (choice) {
                if (choice) {
                    for (key of deleteStorageKeys) {
                        localStorage.removeItem(key);
                    }
                    App.load("home");
                }
            });
        }
    }


    App.controller('settings', function (page) {
        $(page).find(".js-delete-storage-btn").on("click", deleteStorage);


    });
})();