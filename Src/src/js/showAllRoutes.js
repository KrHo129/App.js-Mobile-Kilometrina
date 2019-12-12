(function () {


    function createDeleteBtn(routeIndex, routeData) {
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
                    App.load("showAllRoutes");
                }
            });
        });
        return btnElement;
    }

    function createAllRoutes(page) {
        if (localStorage.getItem("routes") === null) {
            return;
        }

        const routes = JSON.parse(localStorage.getItem("routes"));

        const containerElement = $(page).find(".js-all-routes");

        if (Object.keys(routes).length > 0) {

            let lastIndex = routes.lastIndex;
            let displayedRoutes = 0;
            const maxFails = 50;
            let failCounter = 0;

            while (displayedRoutes < Object.keys(routes).length) {
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
                        cardElement.appendChild(createDeleteBtn(lastIndex, route));

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



    }


    App.controller('showAllRoutes', function (page) {
        createAllRoutes(page);

    })
})();