(function () {
    // which inputs do we want to use as prefabs
    const savedInputPrefabKeys = ["vehicle", "driver", "destination"];
    const lastInputDataKeys = ["vehicle", "driver", "destination", "kmEnd"];
    const validationBlueprint = {
        vehicle: {
            required: true,
            type: "string",
        },
        driver: {
            required: true,
            type: "string",
        },
        destination: {
            required: false,
            type: "string",
        },
        kmStart: {
            required: true,
            type: "number",
        },
        kmEnd: {
            required: true,
            type: "number",
        },
        kmTotal: {
            required: true,
            type: "number",
        },
        dateStart: {
            required: true,
            type: "date",
        },
        dateEnd: {
            required: false,
            type: "date",
        },
        comments: {
            required: false,
            type: "string",
        },
        addToStaticRoutes: {
            required: false,
            type: "bool",
        },
    }
    const inputNames = {
        vehicle: "Vozilo",
        driver: "Voznik",
        destination: "Destinacija",
        kmStart: "Začetni kilometri",
        kmEnd: "Končni kilometri",
        kmTotal: "Opravljeni kilometri",
        dateStart: "Datum",
        dateEnd: "Do datuma",
        comments: "Opombe",
        addToStaticRoutes: "Dodaj med stalne poti",
    }
    const dataToSave = ["vehicle", "driver", "destination", "kmStart", "kmEnd", "kmTotal", "comments"];
    const dataStaticRoute = ["vehicle", "driver", "destination", "kmTotal", "comments"];

    let dataSavedCorrectly = null;
    let daysInWeekChkBoxElements;

    function addDaysToDate(days, oldDate) {
        let date = new Date(oldDate.toISOString());
        date.setDate(date.getDate() + days);
        return date;
    }

    function getInputElements(page) {
        // all input elements
        const inputElements = {
            vehicle: $(page).find(".js-vehicle"),
            driver: $(page).find(".js-driver"),
            destination: $(page).find(".js-destination"),
            kmStart: $(page).find(".js-km-start"),
            kmEnd: $(page).find(".js-km-end"),
            kmTotal: $(page).find(".js-km-total"),
            dateStart: $(page).find(".js-date-start"),
            dateEnd: $(page).find(".js-date-end"),
            comments: $(page).find(".js-comments"),
            addToStaticRoutes: $(page).find(".js-add-to-static-routes"),
        }

        return inputElements;
    }

    // gets all inputs values
    function getInputValues(inputElements) {
        const inputVals = {}
        // get all input values; null if empty
        $.each(inputElements, function (key, value) {
            // if it is a checkbox
            if (value[0].type === "checkbox") {
                inputVals[key] = value.prop('checked');
            } else {
                inputVals[key] = value.val() !== "" ? value.val() : null;
            }
        });

        return inputVals;
    }

    // checks all inputs for new values and saves them to local storage
    function saveNewPrefabData(inputData) {
        let prefabData = {};

        // get current saved prefabs
        if (localStorage.getItem("prefabData") !== null) {
            prefabData = JSON.parse(localStorage.getItem("prefabData"));
        }

        // Check if value already exists; otherwise add it
        $.each(inputData, function (key, value) {
            // if we dont want to save that input value or input was empty, skip
            if (savedInputPrefabKeys.indexOf(key) < 0 || value === null) {
                return;
            }

            // if key doesnt exists, add it with currnet value
            if (typeof (prefabData[key]) === "undefined") {
                prefabData[key] = [value];
            }
            else {
                // case insensitive search for value match
                let matchFound = false;
                $.each(prefabData[key], function (savedKey, savedValue) {
                    if (savedValue.toLowerCase() === value.toLowerCase()) {
                        matchFound = true;
                    }
                });
                // if value was not found, add it
                if (!matchFound) {
                    prefabData[key].push(value);
                }
            }
        });

        // save new prefab data
        localStorage.setItem("prefabData", JSON.stringify(prefabData));
    }

    // saves what we entered last time, so it instantly displayes that on new entry
    function saveLastEnteredInputValues(inputData) {
        const enteredData = {};

        $.each(lastInputDataKeys, function (key, value) {
            if (inputData[value] !== null) {
                // we want to display End Kilometers as start kilometers next time
                if (value === "kmEnd") {
                    enteredData["kmStart"] = inputData[value];
                } else {
                    enteredData[value] = inputData[value];
                }
            }
        });

        localStorage.setItem("lastEnteredData", JSON.stringify(enteredData));
    }

    function fillInputsWithLastEnteredData(inputElements) {
        if (sessionStorage.getItem("staticRouteSelected") !== null) {
            const selectedRoute = parseInt(sessionStorage.getItem("staticRouteSelected"));
            if (selectedRoute >= 0) {
                const staticRouteData = JSON.parse(localStorage.getItem("staticRoutes"))[selectedRoute];
                $.each(staticRouteData, function (inputName, value) {
                    inputElements[inputName].val(value);
                });

                if (localStorage.getItem("lastEnteredData") !== null) {
                    const lastEnteredData = JSON.parse(localStorage.getItem("lastEnteredData"));

                    inputElements.kmStart.val(lastEnteredData.kmStart);

                    inputElements.kmEnd.val(parseInt(inputElements.kmStart.val()) + parseInt(inputElements.kmTotal.val()));
                }
                return;
            }
        }

        if (localStorage.getItem("lastEnteredData") === null) {
            return;
        }
        const lastEnteredData = JSON.parse(localStorage.getItem("lastEnteredData"));

        $.each(lastEnteredData, function (inputName, value) {
            inputElements[inputName].val(value);
        });
    }

    function createPrefabElements(page) {
        let prefabData = {};

        // get current saved prefabs
        if (localStorage.getItem("prefabData") !== null) {
            prefabData = JSON.parse(localStorage.getItem("prefabData"));
        }

        for (let i = 0; i < savedInputPrefabKeys.length; i++) {
            // check if prefab exists; skip if it doesnt
            if (typeof (prefabData[savedInputPrefabKeys[i]]) === "undefined") {
                continue;
            }

            const selector = ".js-" + savedInputPrefabKeys[i];
            // get input section parent
            const inputElement = $(page).find(selector);
            const prefabElement = inputElement.parent().find(".js-prefab");


            // create prefab list 
            const ulElement = document.createElement("ul");
            ulElement.classList.add("app-list");

            // create list element for each prefab saved
            for (let j = 0; j < prefabData[savedInputPrefabKeys[i]].length; j++) {
                const liElement = document.createElement("li");
                liElement.innerHTML = "&raquo; " + prefabData[savedInputPrefabKeys[i]][j];
                liElement.setAttribute("val", prefabData[savedInputPrefabKeys[i]][j]);
                liElement.className = "app-button prefab-item";
                ulElement.appendChild(liElement);
                // on click listener
                $(liElement).on("click", function () {
                    inputElement.val(this.getAttribute("val"))
                    prefabElement.slideUp(250);
                    inputElement.parent()[0].scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }

            // create "close list element"
            const liElement = document.createElement("li");
            liElement.innerHTML = "&raquo; Zapri seznam";
            liElement.className = "app-button prefab-item-close";
            // on click listener
            $(liElement).on("click", function () {
                prefabElement.slideUp(250);
                inputElement.parent()[0].scrollIntoView({ behavior: "smooth", block: "start" });
            });

            // append to html
            ulElement.appendChild(liElement);
            prefabElement.append(ulElement);

            // input element listeners
            inputElement.on("focus", function () {
                prefabElement.slideDown(250);
            })
            inputElement.on("blur", function () {
                prefabElement.slideUp(250);
            });
        }
    }

    function addKilometersCalculations(inputElements) {
        const vals = {
            kmStart: function () { return inputElements.kmStart.val() },
            kmEnd: function () { return inputElements.kmEnd.val() },
            kmTotal: function () { return inputElements.kmTotal.val() },
        };

        // start kilometers change event
        inputElements.kmStart.on("blur", function () {
            if (vals.kmStart() === "" || (vals.kmEnd() === "" && vals.kmTotal() === "")) {
                return;
            }

            if (vals.kmTotal() !== "") {
                try {
                    const kmEnd = (Number.parseInt(vals.kmStart()) + Number.parseInt(vals.kmTotal())).toString();
                    inputElements.kmEnd.val(kmEnd);
                } catch (error) { console.log(error); }
            }
            else if (vals.kmEnd() !== "" && vals.kmTotal() === "") {
                try {
                    const kmTotal = (Number.parseInt(vals.kmEnd()) - Number.parseInt(vals.kmStart())).toString();
                    inputElements.kmTotal.val(kmTotal);
                } catch (error) { console.log(error); }
            }
        });

        // end kilometers change event
        inputElements.kmEnd.on("blur", function () {
            if (vals.kmEnd() === "" || (vals.kmStart() === "" && vals.kmTotal() === "")) {
                return;
            }

            if (vals.kmTotal() !== "") {
                try {
                    const kmStart = (Number.parseInt(vals.kmEnd()) - Number.parseInt(vals.kmTotal())).toString();
                    inputElements.kmStart.val(kmStart);
                } catch (error) { console.log(error); }
            }
            else if (vals.kmStart() !== "" && vals.kmTotal() === "") {
                try {
                    const kmTotal = (Number.parseInt(vals.kmEnd()) - Number.parseInt(vals.kmStart())).toString();
                    inputElements.kmTotal.val(kmTotal);
                } catch (error) { console.log(error); }
            }
        });

        // total kilometers change event
        inputElements.kmTotal.on("blur", function () {
            // if insufitient data, end
            if (vals.kmTotal() === "" || (vals.kmStart() === "" && vals.kmEnd() === "")) {
                return;
            }

            if (vals.kmEnd() !== "") {
                try {
                    const kmStart = (Number.parseInt(vals.kmEnd()) - Number.parseInt(vals.kmTotal())).toString();
                    inputElements.kmStart.val(kmStart);
                } catch (error) { console.log(error); }
            }
            else if (vals.kmStart() !== "" && vals.kmEnd() === "") {
                try {
                    const kmEnd = (Number.parseInt(vals.kmStart()) + Number.parseInt(vals.kmTotal())).toString();
                    inputElements.kmEnd.val(kmEnd);
                } catch (error) { console.log(error); }
            }
        });
    }

    function setCurrDate(inputElements) {
        const currDate = (new Date()).toISOString().split("T")[0];
        inputElements.dateStart.val(currDate);
    }

    // validates current data
    function validateInputData(inputData, inputElements) {
        const errors = {
            missingValues: [],
            incorrectType: [],
            errorCount: 0,
        };

        $.each(inputData, (key, value) => {
            const inputValidationBlueprint = validationBlueprint[key];

            if (value === null && inputValidationBlueprint.required) {
                errors.missingValues.push(key);
                errors.errorCount++;
            }
            if (value !== null && inputValidationBlueprint.type === "number") {
                try {
                    inputElements[key].val(parseInt(value));
                } catch (error) {
                    errors.incorrectType.push(key);
                    errors.errorCount++;
                }
            } else if (value !== true && value !== false && inputValidationBlueprint.type === "bool") {
                errors.incorrectType.push(key);
            } else if (value !== null && inputValidationBlueprint.type === "string") {
                try {
                    inputElements[key].val(value.toString());
                } catch (error) {
                    errors.incorrectType.push(key);
                    errors.errorCount++;
                }
            } else if (value !== null && inputValidationBlueprint.type === "date") {
                const dateFormat = /^[0-9]{4}\-[0-9]{2}-[0-9]{2}$/;

                if (!dateFormat.test(value)) {
                    errors.incorrectType.push(key);
                    errors.errorCount++;
                }
            }

        });

        return errors;
    }

    // displayes input validation errors
    function displayErrors(errors, errorElement) {
        let missingValuesMsg = errors.missingValues.length > 0 ? "Naslednja polja ne smejo biti prazna:" : "";
        let incorrectTypeMsg = errors.incorrectType.length > 0 ? "<br>Nepravilen tip vnosa v naslednjih poljih:" : "";

        $.each(errors.missingValues, (key, value) => {
            missingValuesMsg += "<br> - " + inputNames[value];
        });
        $.each(errors.incorrectType, (key, value) => {
            incorrectTypeMsg += "<br> - " + inputNames[value];
        });

        errorElement.html(missingValuesMsg + incorrectTypeMsg);

        errorElement.show();
    }

    function saveRoute(inputData, inputElements) {
        let data = {};

        if (localStorage.getItem("routes") !== null) {
            data = JSON.parse(localStorage.getItem("routes"));
        } else {
            data.lastIndex = -1;
        }

        let numOfDays = 0;
        let numOfDaysWithoutDeselectedDays = 0;
        const startDate = new Date(inputData.dateStart);

        function getSelectedDays() {
            const selectedDays = [];
            for (let i = 0; i < daysInWeekChkBoxElements.length; i++) {
                const checkBox = daysInWeekChkBoxElements[i];
                if (checkBox.checked) {
                    selectedDays.push(parseInt(checkBox.getAttribute("day")))
                }
            }
            return selectedDays;
        }

        // if end date was entered
        if (inputData.dateEnd !== null) {
            const endDate = new Date(inputData.dateEnd);
            numOfDays = ((endDate - startDate) / 1000 / 60 / 60 / 24);

            const selectedDays = getSelectedDays();

            numOfDaysWithoutDeselectedDays = numOfDays;
            for (let i = -1; i < numOfDays; i++) {
                const currDate = addDaysToDate(i + 1, startDate);
                if (selectedDays.indexOf(currDate.getDay()) < 0) {
                    numOfDaysWithoutDeselectedDays--;
                }
            }
        }

        function save() {
            for (let i = -1; i < numOfDays; i++) {
                const dataIndex = ++data.lastIndex;
                const currDate = addDaysToDate(i + 1, startDate);
                const selectedDays = getSelectedDays();
                if (selectedDays.indexOf(currDate.getDay()) < 0) {
                    continue;
                }

                data[dataIndex] = {};

                data[dataIndex].date = currDate.toISOString().split("T")[0];

                $.each(dataToSave, (key, val) => {
                    data[dataIndex][val] = inputData[val];
                });

                // correct kilometers if needed
                if (i < numOfDays - 1) {
                    const newStartKm = (parseInt(inputData.kmTotal) + parseInt(inputData.kmStart)).toString();
                    const newEndtKm = (parseInt(inputData.kmTotal) + parseInt(inputData.kmEnd)).toString();

                    inputData.kmStart = newStartKm;
                    inputData.kmEnd = newEndtKm;
                    inputElements.kmStart.val(newStartKm);
                    inputElements.kmEnd.val(newEndtKm);
                }
            }

            // add to static routes if needed
            if (inputData.addToStaticRoutes) {
                let staticRouteData = [];
                const newStaticRouteData = {};
                if (localStorage.getItem("staticRoutes") !== null) {
                    staticRouteData = JSON.parse(localStorage.getItem("staticRoutes"));
                }

                $.each(dataStaticRoute, (key, value) => {
                    newStaticRouteData[value] = inputData[value];
                });
                let alreadySaved = false;
                $.each(staticRouteData, (indx, route) => {
                    let totalyTheSame = true;
                    $.each(route, (key, value) => {
                        if (value !== newStaticRouteData[key]) {
                            totalyTheSame = false;
                            return;
                        }
                    });
                    if (totalyTheSame) {
                        alreadySaved = true;
                        return;
                    }
                });
                if (!alreadySaved) {
                    staticRouteData.push(newStaticRouteData);
                    localStorage.setItem("staticRoutes", JSON.stringify(staticRouteData));
                }
            }

            localStorage.setItem("routes", JSON.stringify(data));
            dataSavedCorrectly = true;
        }

        // if the user wants to add more than 7 days at once display warrning
        if (numOfDays > 7) {
            App.dialog({
                title: 'Pozor!',
                text: 'Shraniti želite ' + numOfDaysWithoutDeselectedDays
                    + " dni te poti. Želite nadeljevati?",
                okButton: 'Nadaljuj',
                cancelButton: 'Prekliči'
            }, function (choice) {
                if (choice === false) {
                    dataSavedCorrectly = false;
                    return;
                } else {
                    save();
                }
            });
        } else {
            save();
        }
    }

    function setEndDateLisener(page, inputElements) {
        daysInWeekChkBoxElements = $(page).find(".js-chkbox-days-in-week");

        const dayWeeksElement = $(page).find(".js-div-days-in-week");

        inputElements.dateEnd.on("blur, change", function (e) {
            try {
                const dateFormat = /^[0-9]{4}\-[0-9]{2}-[0-9]{2}$/;
                if (dateFormat.test(this.value)) {
                    if (dayWeeksElement.css("display") === "none") {
                        dayWeeksElement.slideDown(250);
                    }
                } else {
                    if (dayWeeksElement.css("display") !== "none") {
                        dayWeeksElement.slideUp(250);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    // Page controler
    App.controller('addNewRoute', function (page) {
        // find all input elemetns
        const inputElements = getInputElements(page);

        // create list of already used input values
        createPrefabElements(page);

        // create on blur event listeners to calculate Missing kilometers
        addKilometersCalculations(inputElements);

        // fill inputs with last entered data
        fillInputsWithLastEnteredData(inputElements);

        // fill input date with current date
        setCurrDate(inputElements);

        // dateEndLisener - shows/hides days in week
        setEndDateLisener(page, inputElements);

        $(page).find(".js-add-route-done").on("click", function () {
            $(page).find(".js-save").parent()[0].scrollIntoView({ behavior: "smooth", block: "end" });
        });

        // save button click
        $(page).find(".js-save").on("click", function () {
            const inputData = getInputValues(inputElements);

            const errors = validateInputData(inputData, inputElements);
            const errorElement = $(page).find(".js-errors");
            if (errors.errorCount === 0) {
                // hide errors
                errorElement.html("");
                errorElement.hide();
                // Ckeck for new values, add them to prefab data
                saveNewPrefabData(inputData);
                // save/add current route into local storage
                dataSavedCorrectly = null;
                saveRoute(inputData, inputElements);
                const waitLoop = setInterval(() => {
                    if (dataSavedCorrectly === true) {
                        // save current input values (just some of them)
                        saveLastEnteredInputValues(inputData);
                        // go to home page
                        App.load('home');

                        clearInterval(waitLoop);
                    } else if (dataSavedCorrectly === false) {
                        clearInterval(waitLoop);
                    }
                }, 200);
            } else {
                displayErrors(errors, errorElement);
            }
        });
    });
})();