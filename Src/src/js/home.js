(function () {
    // how many last routes we display on home page
    const numOfLastRoutes = 3;
    // statistic colors
    const statisticColors = ["col1", "col2", "col3", "col4", "col5", "col6", "col7", "col8", "col9"];

    // creates list of static route buttons
    function createStaticRoutesList(page) {
        const mainDivElement = $(page).find(".js-static-route-div");
        mainDivElement.hide();

        if (localStorage.getItem("staticRoutes") === null) {
            return;
        }

        const ulElement = $(page).find(".js-static-route-list");

        const staticRoutes = JSON.parse(localStorage.getItem("staticRoutes"));

        if (Object.keys(staticRoutes).length > 0) {

            $.each(staticRoutes, (key, value) => {
                try {
                    const listElement = document.createElement("li");
                    listElement.innerHTML = value.destination + " (" + value.vehicle + ", " + value.driver + ")";
                    listElement.className = "app-button blue";
                    listElement.addEventListener("click", (e) => {
                        sessionStorage.setItem("staticRouteSelected", key);
                        App.load('addNewRoute');
                    });
                    ulElement.append(listElement);
                } catch (error) {
                    console.log(error);
                }
            });

            mainDivElement.show();
        }

    }

    // creates list of last routes
    function createLastRoutesList(page) {
        const mainDivElement = $(page).find(".js-last-route-div");
        mainDivElement.hide();

        if (localStorage.getItem("routes") === null) {
            return;
        }

        const containerElement = $(page).find(".js-last-routes-list");

        const routes = JSON.parse(localStorage.getItem("routes"));

        if (Object.keys(routes).length > 0) {

            let lastIndex = routes.lastIndex;
            let displayedRoutes = 0;
            const maxFails = 50;
            let failCounter = 0;

            while (displayedRoutes < numOfLastRoutes) {
                try {
                    if (typeof (routes[lastIndex]) !== "undefined") {
                        const route = routes[lastIndex];

                        const cardElement = document.createElement("div");
                        cardElement.innerHTML = ("<strong>" + route.destination + " - " + route.kmTotal + " km</strong>"
                            + "<p>" + route.vehicle + ", " + route.driver + "</p>"
                            + "<p><em>"
                            + (new Date(route.date)).toLocaleDateString("sl-SI", {
                                year: "numeric", month: 'long', day: 'numeric'
                            })
                            + "</em></p>");
                        cardElement.className = "card";
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

            mainDivElement.show();
        }

    }

    function createStatitics(page) {
        const mainDivElement = $(page).find(".js-statistics");
        mainDivElement.hide();

        if (localStorage.getItem("routes") === null) {
            return;
        }
        if (localStorage.getItem("statisticRange") === null) {
            localStorage.setItem("statisticRange", JSON.stringify({ text: "Vse", range: "-1" }));
        }
        const statisticRangeData = JSON.parse(localStorage.getItem("statisticRange"));
        const statisticRange = parseInt(statisticRangeData.range);
        $(page).find(".js-statistic-range-displayed").html(statisticRangeData.text);
        
        mainDivElement.html("");

        const routes = JSON.parse(localStorage.getItem("routes"));
        const processedData = {};

        if (Object.keys(routes).length > 1) {
            // proccess data
            const currDate = new Date();
            $.each(routes, (key, routeData) => {
                if (isNaN(key)) {
                    return;
                }
                if (statisticRange >= 0) {
                    try {
                        const routeDate = new Date(routeData.date);
                        const dateDiff = routeDate - currDate;
                        if (dateDiff < statisticRange * 1000 * 60 * 60 * 24 * - 1) {
                            return;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (typeof (processedData[routeData.vehicle]) === "undefined") {
                    processedData[routeData.vehicle] = {};
                }
                if (typeof (processedData[routeData.vehicle].driver) === "undefined") {
                    processedData[routeData.vehicle].driver = {};
                    processedData[routeData.vehicle].totalKm = 0;
                }
                if (typeof (processedData[routeData.vehicle].driver[routeData.driver]) === "undefined") {
                    processedData[routeData.vehicle].driver[routeData.driver] = {};
                    processedData[routeData.vehicle].driver[routeData.driver].totalKm = 0;
                }
                try {
                    processedData[routeData.vehicle].driver[routeData.driver].totalKm += parseInt(routeData.kmTotal);
                    processedData[routeData.vehicle].totalKm += parseInt(routeData.kmTotal);
                } catch (error) {
                    console.log(error);
                }
            });

            $.each(processedData, (vehicle, vehicleData) => {
                const cardElement = document.createElement("div");
                cardElement.className = "card";
                mainDivElement.append(cardElement);

                const vehicleElement = document.createElement("p");
                vehicleElement.className = "cardTitle";
                vehicleElement.innerHTML = vehicle;
                cardElement.appendChild(vehicleElement);

                let colorIndex = 0;
                const colorIndicatorBar = document.createElement("div");
                colorIndicatorBar.className = "color-idicator-bar";
                cardElement.appendChild(colorIndicatorBar);

                $.each(vehicleData.driver, (driver, driverData) => {
                    const driverKm = driverData.totalKm;
                    const kmInPercent = Math.floor(driverKm / vehicleData.totalKm * 1000) / 10;
                    const driverElement = document.createElement("p");

                    const driverColorElement = document.createElement("div");
                    if (colorIndex >= statisticColors.length) {
                        colorIndex = 0;
                    }
                    const indicatorColor = statisticColors[colorIndex++];
                    driverColorElement.className = indicatorColor + " statistic-color-indicator";
                    driverElement.appendChild(driverColorElement);

                    driverElement.innerHTML += (driver + ": " + driverKm + " km ("
                        + kmInPercent + "%)");
                    cardElement.appendChild(driverElement);

                    const indicatorProgresElement = document.createElement("div");
                    indicatorProgresElement.className = indicatorColor;
                    indicatorProgresElement.style.height = "100%";
                    indicatorProgresElement.style.width = kmInPercent.toString() + "%";
                    indicatorProgresElement.style.padding = "0";
                    indicatorProgresElement.style.margin = "0";
                    indicatorProgresElement.style.display = "inline-block";

                    colorIndicatorBar.appendChild(indicatorProgresElement);
                });
            });

            mainDivElement.show();
        }
    }

    function hideShowStatisticRange(e) {
        const ulElement = $(".js-statistic-range-list");

        if (ulElement.css("display") === "none") {
            ulElement.slideDown(250);
        } else {
            ulElement.slideUp(250);
        }
    }

    App.controller('home', function (page) {
        createStaticRoutesList(page);

        createLastRoutesList(page);

        createStatitics(page);

        // display / hide statistic range options
        $(page).find(".js-statistic-range-div").on("click", hideShowStatisticRange);
        // select new statistic option
        $(page).find(".js-statistic-selection").on("click", function () {
            const ulElement = $(".js-statistic-range-list");
            ulElement.slideUp(250);

            const newText = this.innerHTML.trim().substring(2);
            $(".js-statistic-range-displayed").html(newText);

            localStorage.setItem("statisticRange", JSON.stringify({ text: newText, range: this.value.toString() }));

            createStatitics(page);
        });

        $(page).find(".app-button").on("click", function () {
            sessionStorage.setItem("staticRouteSelected", -1);
        })

    });

})();