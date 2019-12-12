(function () {

    function createFilterData(page) {
        if (localStorage.getItem("routes") === null) {
            return;
        }
        const routes = JSON.parse(localStorage.getItem("routes"));

        const checkedDataKeys = ["vehicle", "driver", "destination"];
        const data = {
            vehicle: [],
            driver: [],
            destination: [],
        };

        const routeKeys = Object.keys(routes);
        for (let i = 0; i < routeKeys.length; i++) {
            try {
                const route = routes[routeKeys[i]];
                if (Object.keys(route).length > 0) {

                    for (key of Object.keys(route)) {
                        if (checkedDataKeys.indexOf(key) >= 0 && data[key].indexOf(route[key]) < 0) {
                            data[key].push(route[key])
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        for (key of checkedDataKeys) {
            const targetElement = $(page).find('.js-filter-details[filter-data="' + key + '"');
            for (value of data[key]) {
                const labelElement = document.createElement("label");
                labelElement.classList.add("container");
                labelElement.innerHTML = value;

                const inputElement = document.createElement("input");
                inputElement.setAttribute("type", "checkbox");
                inputElement.setAttribute("value", value);
                inputElement.setAttribute("filter-data", key);
                inputElement.classList.add("js-checkBox-filter");
                inputElement.checked = true;
                labelElement.appendChild(inputElement);

                const checkmarkElement = document.createElement("span");
                checkmarkElement.classList.add("checkmark");
                labelElement.appendChild(checkmarkElement);

                targetElement.append(labelElement);
            }
        }

    }

    function createDeleteBtn(routeIndex, routeData, page) {
        const btnElement = document.createElement("button");
        btnElement.classList.add("app-button");
        btnElement.classList.add("red");
        btnElement.classList.add("delete-btn");
        btnElement.innerHTML = "X";
        btnElement.addEventListener("click", function () {
            App.dialog({
                title: 'Pozor!',
                text: ("Izbrisati želite pot: \n" +
                    routeData.destination + " - " + routeData.kmTotal + " km; "
                    + routeData.vehicle + ", " + routeData.driver + "; "
                    + (new Date(routeData.date)).toLocaleDateString("sl-SI", {
                        year: "numeric", month: 'long', day: 'numeric'
                    })),
                okButton: 'Nadaljuj',
                cancelButton: 'Prekliči'
            }, function (choice) {
                if (choice) {
                    const routes = JSON.parse(localStorage.getItem("routes"));
                    delete routes[routeIndex.toString()];

                    localStorage.setItem("routes", JSON.stringify(routes));
                    // App.load("showAllRoutes");
                    createAllRoutes(page, getFilterData(page));
                }
            });
        });
        return btnElement;
    }

    function createAllRoutes(page, filterData) {
        if (localStorage.getItem("routes") === null) {
            return;
        }
        
        const routes = JSON.parse(localStorage.getItem("routes"));

        const containerElement = $(page).find(".js-all-routes");
        containerElement.html("");
        if (Object.keys(routes).length > 0) {

            let lastIndex = routes.lastIndex;
            let displayedRoutes = 0;
            const maxFails = 50;
            let failCounter = 0;

            while (displayedRoutes < Object.keys(routes).length) {
                try {
                    if (typeof (routes[lastIndex]) !== "undefined") {
                        const route = routes[lastIndex];

                        // filters
                        if (filterData !== null) {
                            // check for vehicle
                            if (filterData.vehicle.indexOf(route.vehicle) < 0) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // check for driver
                            if (filterData.driver.indexOf(route.driver) < 0) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // check for destination
                            if (filterData.destination.indexOf(route.destination) < 0) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // min km
                            if (filterData.kmMin.length > 0 && parseInt(route.kmTotal) < filterData.kmMin) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // max km
                            if (filterData.kmMax.length > 0 && parseInt(route.kmTotal) > filterData.kmMax) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // start date
                            if(filterData.dateStart.length > 0 && new Date(filterData.dateStart) - new Date(route.date) > 0) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                            // end date
                            if(filterData.dateEnd.length > 0 && new Date(filterData.dateEnd) - new Date(route.date) < 0) {
                                lastIndex--;
                                displayedRoutes++;
                                continue;
                            }
                        }
                        const comments = route.comments === null ? "" : ("<p><small>" + route.comments + "</small></p>");
                        const cardElement = document.createElement("div");
                        cardElement.innerHTML = ("<strong>" + route.destination + " - " + route.kmTotal + " km</strong>"
                            + "<p>" + route.vehicle + ", " + route.driver + "</p>"
                            + "<p><em>"
                            + (new Date(route.date)).toLocaleDateString("sl-SI", {
                                year: "numeric", month: 'long', day: 'numeric'
                            })
                            + "</em></p>" + comments);
                        cardElement.className = "card";
                        cardElement.appendChild(createDeleteBtn(lastIndex, route, page));

                        containerElement.append(cardElement);

                        lastIndex--;
                        displayedRoutes++;
                        if (lastIndex < 0) {
                            break;
                        }
                    } else {
                        if (lastIndex-- < 0) {
                            break;
                        }
                    }
                } catch (error) {
                    lastIndex--;

                    if (failCounter++ > maxFails) {
                        break;
                    }
                    console.log(error);
                }
            }
        }
        // if no routes match the filters
        if (containerElement.html() === "") {
            containerElement.html("<div class='subtitle'>Ni najdenih vnosov</div>");
        }
    }

    function btnDeleteAllClickEvent(e) {
        App.dialog({
            title: 'Pozor!',
            text: "Želite pobrisati vse shranjene vnose?",
            okButton: 'Nadaljuj',
            cancelButton: 'Prekliči'
        }, function (choice) {
            if (choice) {
                localStorage.removeItem("routes");
                App.load("home");
            }
        });
    }

    function showHideFilterSection(e) {
        const filterSectionElement = $(".js-filters");
        if (filterSectionElement.css("display") === "none") {
            filterSectionElement.slideDown(250);
        } else {
            filterSectionElement.slideUp(250);
        }
    }

    function getFilterData(page) {
        const filterData = {
            vehicle: [],
            driver: [],
            destination: [],
            dateStart: [],
            dateEnd: [],
            kmMin: [],
            kmMax: [],
        };

        const filterElements = $(page).find(".js-filter-details [filter-data]");

        for (let i = 0; i < filterElements.length; i++) {
            const singleFilterElement = filterElements[i];

            const dateFormat = /^[0-9]{4}\-[0-9]{2}-[0-9]{2}$/;

            const key = singleFilterElement.getAttribute("filter-data");
            const val = singleFilterElement.value;

            if (singleFilterElement.type === "checkbox" && singleFilterElement.checked) {
                filterData[key].push(val);
            } else if (singleFilterElement.type === "number" && val !== "") {
                filterData[key].push(parseInt(val));
            } else if (singleFilterElement.type === "date" && dateFormat.test(val)) {
                filterData[key].push(val);
            }
        }
        return filterData;
    }

    App.controller('showAllRoutes', function (page) {
        // creates elements for every route
        createAllRoutes(page, null);

        // creation of filters (create dynamic elements of filters)
        createFilterData(page);

        // click event for delete all routes btn
        $(page).find(".js-delete-all").on("click", btnDeleteAllClickEvent);

        // hide show filter button
        $(page).find(".js-show-hide-filters").on("click", showHideFilterSection);

        // confirm entered filters button
        $(page).find(".js-filters-confirm").on("click", function (e) {
            createAllRoutes(page, getFilterData(page));
            showHideFilterSection();
        });
    });
})();