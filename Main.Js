require([
    "esri/layers/FeatureLayer",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand",
    "esri/request",
    "esri/views/layers/LayerView",
    "esri/core/reactiveUtils",
], (
    FeatureLayer,
    esriConfig,
    Map,
    MapView,
    BasemapGallery,
    Expand,
    esriRequest,
    LayerView,
    reactiveUtils
) => {
    // API Key for Esri Developers
    esriConfig.apiKey =
        "AAPKf12eabe3574545c5a526973d8df2ff0c87ZLKeC4LKFWOmrLU7U1JFY5G1vN0urdPn0_KyHkqTCih-DcdXWT1Ui1tt2lCrfe";


    // Add New Feature Layer To Inject it to the Map
    const layer = new FeatureLayer({
        // URL to the service
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
        // Pop up of appear when click on feature
        popupTemplate: {
            title: "{NAME}",
            content: `<ul>
          <li>WEBSITE: {WEBSITE}</Li>
          <li>ADDRESS: {ADDRESS}</Li>
          <li>STATE: {STATE}</Li>
          <li>ZIP: {ZIP}</Li>
      
      </ul>`,
        },
        // Create Cluster for Points which Retrived from the Feature Layer
        featureReduction: {
            type: "cluster",

            clusterMinSize: "50px",
            clusterMaxSize: "100px",

            labelingInfo: [
                {
                    deconflictionStrategy: "none",
                    labelExpressionInfo: {
                        expression: "Text($feature.cluster_count, '#,###')",
                    },
                    symbol: {
                        type: "text",
                        color: "#453437",
                        font: {
                            weight: "bold",
                            family: "Noto Sans",
                            size: "12px",
                        },
                    },
                    labelPlacement: "center-center",
                },
            ],
            popupTemplate: {
                // cluster_count is an aggregate field indicating the number
                // of features summarized by the cluster
                content: "This cluster represents {cluster_count} Universities.",
            },
        },
    });
// Create Map with spacifc type of basemap and adding the Feature Layer
    const map = new Map({
        basemap: "dark-gray-vector",
        layers: [layer],
    });
    // Injecting View to Html Container with the Previous Map
    let view = new MapView({
        // ID of DOM element containing the view
        container: "viewDiv",
        // Map/WebMap object
        map: map,
        center: [31, 30],
        zoom: 4,
    });
// Function=>>  clicking in the view to go to Point which user clicked on it
    view.on("click", (e) => {
        view.goTo(
            {
                center: [e.mapPoint.longitude, e.mapPoint.latitude],
                zoom: 10,
            },
            {
                duration: 2000,
            }
        );
    });
    // Cretaing of Basemap Galery Wedgiet on the Map
    let basemapGallery = new BasemapGallery({
        view: view,
    });
    //Injecting Wedgit to the View and Spacific Place
    view.ui.add(basemapGallery, "bottom-right");
    var btn = document.getElementById("bsm");
    flag = false;
    //Add Event on the Botton which will show or hide the basemap gallary
    btn.addEventListener("click", () => {
        if (flag == false) {
            view.ui.remove(basemapGallery);
            flag = true;
            btn.textContent = "Show Basemap Gallary";
        } else {
            view.ui.add(basemapGallery, "bottom-right");
            flag = false;
            btn.textContent = "Hide Basemap Gallary";
        }
    });
    
    // Adding the event on layer when it created go to Extent which contain all the clustred Points

    layer.on("layerview-create", (e) => {
      layer.queryExtent().then(data => {
        // console.log(data.extent)

        view.goTo(data.extent, {
          duration: 2000,
        })
      })
    })
// Adding Event if the layer creation have any erros will create alert with the following msg "Error on Feature Layer Creation"
    layer.on("layerview-create-error", (e) => {
        alert("Error on Feature Layer Creation");
    });
// Creation of Wegit of title Expand in the Top right of the Map
    const titleContent = document.createElement("div");
    titleContent.style.padding = "15px";
    titleContent.style.backgroundColor = "black";
    titleContent.style.width = "300px";
    titleContent.innerHTML = [
        "<div id='title' class='esri-widget'>",
        "K & A Task.",
        "</div>",
    ].join(" ");

    const titleExpand = new Expand({
        expandIconClass: "esri-icon-dashboard",
        expandTooltip: "Summary stats",
        view: view,
        content: titleContent,
        expanded: view.widthBreakpoint !== "xsmall",
    });
    view.ui.add(titleExpand, "top-right");

// Adding The Url which will be used in qury data 
    var reqUrl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0/query";

// Adding The query optins which will be used in filtering data and return specific fields or values
    var reqOpt = {
        query: {
            where: "1=1",
            outFields: "CITY,STATE,TOT_ENROLL",
            f: "json",
            returnExtentOnly: false,
            //query: map.extent,
            geometryType: "esriGeometryPolygon",
        },
    };
// Requesting Data from the Feature Layer 
    esriRequest(reqUrl, reqOpt).then(async (res) => {
        //console.log(res);
        //console.log(res.data.features[0].attributes.STATE);
// Refill the data when the extent change with following logic according to the requirments in the task 
        await reactiveUtils.when(
            () => view?.extent?.xmin,
            async (xmin, ymin) => {
                //console.log(`Extent change xmin = ${xmin}`)
                //&& res.data.features[i].geometry.x<xmin
                var x = [];
                let arrOfCities = [];
                let arrOfStates = [];

                var results = [];
                var count = 0;
                var totalNumOfStuInCityPerCity = 0;
                var totalNumOfStuInCityArrPerCity = [];
                var results2 = [];
                var count2 = 0;
                var totalNumOfStuInCity = 0;
                var totalNumOfStuInCityArr = [];

                for (let i = 0; i < res.data.features.length; i++) {
                    if (res.data.features[i].geometry.x > xmin) {
                        await x.push(res.data.features[i]);
                    }
                }
                if (x.length != 0) {
                    for (let i = 0; i < x.length; i++) {
                        if (!arrOfCities.includes(x[i].attributes.CITY)) {
                            arrOfCities.push(x[i].attributes.CITY);
                        }
                        if (!arrOfStates.includes(x[i].attributes.STATE)) {
                            arrOfStates.push(x[i].attributes.STATE);
                        }
                    }

                    for (let index = 0; index < arrOfCities.length; index++) {
                        for (let k = 0; k < x.length; k++) {
                            if (x[k].attributes.CITY == arrOfCities[index]) {
                                count++;
                                totalNumOfStuInCityPerCity += x[k].attributes.TOT_ENROLL;
                            }
                        }
                        results.push(count);
                        count = 0;
                        totalNumOfStuInCityArrPerCity.push(totalNumOfStuInCityPerCity);
                        totalNumOfStuInCityPerCity = 0;
                    }

                    for (let index2 = 0; index2 < arrOfStates.length; index2++) {
                        for (let j = 0; j < x.length; j++) {
                            if (x[j].attributes.STATE == arrOfStates[index2]) {
                                count2++;
                                totalNumOfStuInCity += x[j].attributes.TOT_ENROLL;
                            }
                        }
                        results2.push(count2);
                        count2 = 0;
                        totalNumOfStuInCityArr.push(totalNumOfStuInCity);
                        totalNumOfStuInCity = 0;
                    }
                    //console.log(totalNumOfStuInCityArr)
                    //console.log(results)
                    //console.log(arrOfCities.length);
                    //console.log(arrOfStates.length);
                    await CreateCharts(
                        arrOfCities,
                        arrOfStates,
                        results,
                        results2,
                        totalNumOfStuInCityArr,
                        totalNumOfStuInCityArrPerCity
                    );
                } else {
                    //rebuilding empty charts if the count of features of array become 0
                    raceChart = new Chart("myChart", {
                        type: "horizontalBar",
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: "Dataset 1",
                                    backgroundColor: "red",
                                    data: [],
                                },
                            ],
                        },
                        options: {
                            title: {
                                display: true,
                                text: "Number of schools per city",
                                legend: { display: false },
                                responsive: false,
                            },
                        },
                    });
                    raceChart2 = new Chart("myChart2", {
                        type: "horizontalBar",
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: "Dataset 1",
                                    backgroundColor: "red",
                                    data: [],
                                },
                            ],
                        },
                        options: {
                            title: {
                                display: true,
                                text: "Number of schools per city",
                                legend: { display: false },
                                responsive: false,
                            },
                        },
                    });
                    raceChart3 = new Chart("myChart3", {
                        type: "horizontalBar",
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: "Dataset 1",
                                    backgroundColor: "red",
                                    data: [],
                                },
                            ],
                        },
                        options: {
                            title: {
                                display: true,
                                text: "Number of schools per city",
                                legend: { display: false },
                                responsive: false,
                            },
                        },
                    });
                    raceChart4 = new Chart("myChart4", {
                        type: "horizontalBar",
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: "Dataset 1",
                                    backgroundColor: "red",
                                    data: [],
                                },
                            ],
                        },
                        options: {
                            title: {
                                display: true,
                                text: "Number of schools per city",
                                legend: { display: false },
                                responsive: false,
                            },
                        },
                    });
                }

                console.log(x);
            }
        );

        //     var NumOfCities = document.getElementById("NumOfCities")

        // NumOfCities.textContent = `Number of Cities = ${arrOfCities.length}`
        // var NumOfCities = document.getElementById("NumOfStates")

        // NumOfCities.textContent = `Number of States = ${arrOfStates.length}`
    });

    // Cratin of Charts using charts.js librery 
    async function CreateCharts(
        arrOfCities,
        arrOfStates,
        results,
        results2,
        totalNumOfStuInCityArr,
        totalNumOfStuInCityArrPerCity
    ) {
        new Chart("myChart", {
            type: "horizontalBar",
            data: {
                labels: arrOfCities,
                datasets: [
                    {
                        label: "Dataset 1",
                        backgroundColor: "red",
                        data: results,
                    },
                ],
            },
            options: {
                title: {
                    display: true,
                    text: "Number of schools per city",
                    legend: { display: false },
                    responsive: false,
                },
            },
        });
        new Chart("myChart2", {
            type: "bar",
            data: {
                labels: arrOfStates,
                datasets: [
                    {
                        label: "Dataset 2",
                        backgroundColor: "purple",
                        data: results2,
                    },
                ],
            },
            options: {
                title: {
                    display: true,
                    text: "Number of schools per State",
                    legend: { display: false },
                    responsive: false,
                },
            },
        });
        new Chart("myChart3", {
            type: "bar",
            data: {
                labels: arrOfStates,
                datasets: [
                    {
                        label: "Dataset 3",
                        backgroundColor: "green",
                        data: totalNumOfStuInCityArr,
                    },
                ],
            },
            options: {
                title: {
                    display: true,
                    text: "Number of Students per State",
                    legend: { display: false },
                    responsive: false,
                },
            },
        });
        new Chart("myChart4", {
            type: "horizontalBar",
            data: {
                labels: arrOfCities,
                datasets: [
                    {
                        label: "Dataset 4",
                        backgroundColor: "blue",
                        data: totalNumOfStuInCityArrPerCity,
                    },
                ],
            },
            options: {
                title: {
                    display: true,
                    text: "Number of Students per City",
                    legend: { display: false },
                    responsive: false,
                },
            },
        });
    }
});
