/**
 * Created by danfma on 09/03/15.
 */
///<reference path="./_references.d.ts"/>
var gogeo;
(function (gogeo) {
    gogeo.settings;
    var Configuration = (function () {
        function Configuration() {
        }
        Object.defineProperty(Configuration, "apiUrl", {
            get: function () {
                return gogeo.settings["api.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "tileUrl", {
            get: function () {
                return gogeo.settings["tile.url"];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "subdomains", {
            get: function () {
                return gogeo.settings["subdomains"];
            },
            enumerable: true,
            configurable: true
        });
        Configuration.makeUrl = function (path) {
            var serverUrl = Configuration.apiUrl;
            if (path.match(".*tile.png.*") || path.match(".*cluster.json.*")) {
                serverUrl = Configuration.tileUrl;
            }
            if (serverUrl && !serverUrl.endsWith("/")) {
                serverUrl = serverUrl + "/";
            }
            return "http://" + serverUrl + (path.startsWith("/") ? path.substring(1) : path);
        };
        Configuration.getTotalTweetsUrl = function () {
            return "http://maps.demos.gogeo.io/1.0/tools/totalRead";
        };
        Configuration.getDateRangeUrl = function () {
            return Configuration.makeUrl("aggregations/" + Configuration.getDatabaseName() + "/" + Configuration.getCollectionName() + "/stats?mapkey=" + Configuration.getMapKey() + "&field=" + Configuration.getDateField());
        };
        Configuration.getPlaceUrl = function (place) {
            return "http://maps.demos.gogeo.io/1.0/tools/where/" + place;
        };
        Configuration.getCollectionName = function () {
            return gogeo.settings["collection"];
        };
        Configuration.getShortenUrl = function () {
            return "http://maps.demos.gogeo.io/1.0/tools/short";
        };
        Configuration.getDatabaseName = function () {
            return "demos";
        };
        Configuration.getMapKey = function () {
            // TODO: Export this to development/deployment config file
            return "123";
        };
        Configuration.getDateField = function () {
            // TODO: Export this to development/deployment config file
            return "datemmdd";
        };
        Configuration.getInterval = function () {
            // TODO: Export this to development/deployment config file
            return "day";
        };
        Configuration.getAggField = function () {
            // TODO: Export this to development/deployment config file
            return "typeestab";
        };
        Configuration.getAggSummary = function () {
            // TODO: Export this to development/deployment config file
            return "value";
        };
        Configuration.getAggSize = function () {
            // TODO: Export this to development/deployment config file
            return 0;
        };
        Configuration.getAggChartField = function () {
            // TODO: Export this to development/deployment config file
            return "value";
        };
        Configuration.getTypePayGroupBy = function () {
            // TODO: Export this to development/deployment config file
            return "sum,typepay";
        };
        Configuration.getTypeEstabGroupBy = function () {
            // TODO: Export this to development/deployment config file
            return "sum,typeestab.raw";
        };
        Configuration.getSummaryGroupBy = function () {
            // TODO: Export this to development/deployment config file
            return "sum,period";
        };
        Configuration.getPlaceFields = function () {
            // TODO: Export this to development/deployment config file
            return ["city", "state"];
        };
        Configuration.tweetFields = function () {
            // TODO: Export this to development/deployment config file
            return [
                "people",
                "address",
                "value",
                "typepay",
                "payway",
                "typeestab",
                "flag",
                "nameestab",
                Configuration.getDateField(),
                "city",
                "state",
                "cnpj",
                "status"
            ];
        };
        return Configuration;
    })();
    gogeo.Configuration = Configuration;
    var mod = angular.module("gogeo", ["ngRoute", "ngCookies", "angularytics", "linkify", "ngGeolocation", "nvd3", 'angular-capitalize-filter'])
        .config([
        "$routeProvider",
        "AngularyticsProvider",
        function ($routeProvider, angularyticsProvider) {
            $routeProvider
                .when("/welcome", {
                controller: "WelcomeController",
                controllerAs: "welcome",
                templateUrl: "welcome/page.html",
                reloadOnSearch: false
            })
                .when("/dashboard", {
                controller: "DashboardController",
                controllerAs: "dashboard",
                templateUrl: "dashboard/page.html",
                reloadOnSearch: false
            })
                .otherwise({
                redirectTo: "/dashboard",
                reloadOnSearch: false
            });
            if (window.location.hostname.match("gogeo.io")) {
                angularyticsProvider.setEventHandlers(["Google"]);
            }
            else {
                angularyticsProvider.setEventHandlers(["Console"]);
            }
        }
    ]).run(function (Angularytics) {
        Angularytics.init();
    });
    function registerController(controllerType) {
        console.debug("registrando controlador: ", controllerType.$named);
        mod.controller(controllerType.$named, controllerType);
    }
    gogeo.registerController = registerController;
    function registerService(serviceType) {
        console.debug("registrando serviço: ", serviceType.$named);
        mod.service(serviceType.$named, serviceType);
    }
    gogeo.registerService = registerService;
    function registerDirective(directiveName, config) {
        console.debug("registrando diretiva: ", directiveName);
        mod.directive(directiveName, config);
    }
    gogeo.registerDirective = registerDirective;
    function registerFilter(filterName, filter) {
        console.debug("registrando filtro: ", filterName);
        mod.filter(filterName, function () { return filter; });
    }
    gogeo.registerFilter = registerFilter;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardController = (function () {
        function DashboardController() {
        }
        DashboardController.$named = "DashboardController";
        return DashboardController;
    })();
    gogeo.DashboardController = DashboardController;
    gogeo.registerController(DashboardController);
})(gogeo || (gogeo = {}));
///<reference path="../shell.ts" />
/**
 * Created by danfma on 17/03/15.
 */
var gogeo;
(function (gogeo) {
    var AbstractController = (function () {
        /**
         * Construtor
         */
        function AbstractController($scope) {
            this.$scope = $scope;
            this.subscriptions = [];
        }
        /**
         * Inicializa este controlador.
         */
        AbstractController.prototype.initialize = function () {
            var _this = this;
            var selfProperty = Enumerable.from(this.$scope)
                .where(function (x) { return x.value === _this; })
                .select(function (x) { return x.key; })
                .firstOrDefault();
            this.propertyName = selfProperty;
            this.$scope.$on("$destroy", function () { return _this.dispose(); });
        };
        AbstractController.prototype.dispose = function () {
            for (var i = 0; i < this.subscriptions.length; i++) {
                var subscription = this.subscriptions[i];
                subscription.dispose();
            }
            this.subscriptions = null;
        };
        AbstractController.prototype.evalProperty = function (path) {
            return this.$scope.$eval(this.propertyName + "." + path);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watch = function (property, handler, objectEquality) {
            if (objectEquality === void 0) { objectEquality = false; }
            return this.$scope.$watch(this.propertyName + "." + property, handler, objectEquality);
        };
        /**
         * Observa uma determinada propriedade desta instância.
         */
        AbstractController.prototype.watchCollection = function (property, handler) {
            return this.$scope.$watchCollection(this.propertyName + "." + property, handler);
        };
        /**
         * Observer uma determinada propriedade desta instância de forma reativa.
         */
        AbstractController.prototype.watchAsObservable = function (property, isCollection, objectEquality) {
            var _this = this;
            if (isCollection === void 0) { isCollection = false; }
            if (objectEquality === void 0) { objectEquality = false; }
            return Rx.Observable.createWithDisposable(function (observer) {
                var dispose;
                if (isCollection) {
                    dispose = _this.watchCollection(property, function (value) {
                        observer.onNext(value);
                    });
                }
                else {
                    dispose = _this.watch(property, function (value) {
                        observer.onNext(value);
                    }, objectEquality);
                }
                return {
                    dispose: function () {
                        dispose();
                    }
                };
            });
        };
        AbstractController.prototype.watchObjectAsObservable = function (property) {
            return this.watchAsObservable(property, undefined, true);
        };
        AbstractController.prototype.releaseOnDestroy = function (subscription) {
            if (subscription)
                this.subscriptions.push(subscription);
        };
        return AbstractController;
    })();
    gogeo.AbstractController = AbstractController;
})(gogeo || (gogeo = {}));
/// <reference path="../shell.ts"/>
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    var WelcomeController = (function () {
        function WelcomeController() {
        }
        WelcomeController.$named = "WelcomeController";
        return WelcomeController;
    })();
    gogeo.WelcomeController = WelcomeController;
    gogeo.registerController(WelcomeController);
})(gogeo || (gogeo = {}));
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    function prefix(eventName) {
        return "gogeo:" + eventName;
    }
    var DashboardEvent = (function () {
        function DashboardEvent() {
        }
        DashboardEvent.mapLoaded = prefix("dashboard:mapLoaded");
        return DashboardEvent;
    })();
    gogeo.DashboardEvent = DashboardEvent;
})(gogeo || (gogeo = {}));
///<reference path="./interfaces.ts" />
var gogeo;
(function (gogeo) {
    var NeSwPoint = (function () {
        function NeSwPoint(ne, sw) {
            this.ne = ne;
            this.sw = sw;
        }
        return NeSwPoint;
    })();
    gogeo.NeSwPoint = NeSwPoint;
    var TextQueryBuilder = (function () {
        function TextQueryBuilder(fields, term) {
            this.fields = fields;
            this.term = term;
        }
        TextQueryBuilder.prototype.build = function () {
            return {
                query: {
                    query_string: {
                        query: this.term,
                        fields: this.fields
                    }
                }
            };
        };
        TextQueryBuilder.HashtagText = ["entities.hashtags.text"];
        TextQueryBuilder.UserScreenName = ["user.screen_name"];
        TextQueryBuilder.Text = ["text"];
        TextQueryBuilder.Place = gogeo.Configuration.getPlaceFields();
        return TextQueryBuilder;
    })();
    gogeo.TextQueryBuilder = TextQueryBuilder;
    var BoolQuery = (function () {
        function BoolQuery() {
            this.requestData = {
                must: []
            };
        }
        BoolQuery.prototype.addMustQuery = function (q) {
            this.requestData["must"].push(q.build()["query"]);
        };
        BoolQuery.prototype.build = function () {
            return {
                query: {
                    bool: this.requestData
                }
            };
        };
        return BoolQuery;
    })();
    gogeo.BoolQuery = BoolQuery;
    var ThematicQuery = (function () {
        function ThematicQuery(queries, prevQuery) {
            this.queries = queries;
            this.prevQuery = prevQuery;
        }
        ThematicQuery.prototype.build = function () {
            var query = {
                query: {
                    filtered: {
                        filter: {
                            or: {}
                        }
                    }
                }
            };
            var filters = [];
            if (this.prevQuery) {
                query["query"]["filtered"]["query"] = this.prevQuery["query"];
            }
            for (var index in this.queries) {
                var stq = this.queries[index];
                if (stq instanceof SourceTermQuery || stq instanceof TextQueryBuilder) {
                    filters.push(stq.build());
                }
                else if (stq["query"]["filtered"]["filter"]["or"]["filters"]) {
                    var subFilters = stq["query"]["filtered"]["filter"]["or"]["filters"];
                    for (var k in subFilters) {
                        filters.push(subFilters[k]);
                    }
                }
            }
            query["query"]["filtered"]["filter"]["or"]["filters"] = filters;
            return query;
        };
        return ThematicQuery;
    })();
    gogeo.ThematicQuery = ThematicQuery;
    var DateRangeQueryBuilder = (function () {
        function DateRangeQueryBuilder(field, range) {
            this.field = field;
            this.range = range;
        }
        DateRangeQueryBuilder.prototype.build = function () {
            var query = {
                range: {}
            };
            var fieldRestriction = query.range[this.field] = {};
            var range = this.range;
            if (range.start) {
                fieldRestriction["gte"] = this.format(range.start);
            }
            if (range.end) {
                fieldRestriction["lte"] = this.format(range.end);
            }
            return query;
        };
        DateRangeQueryBuilder.prototype.format = function (date) {
            return moment(date).format("YYYY-MM-DD");
        };
        DateRangeQueryBuilder.DateRange = gogeo.Configuration.getDateField();
        return DateRangeQueryBuilder;
    })();
    gogeo.DateRangeQueryBuilder = DateRangeQueryBuilder;
    var SourceTermQuery = (function () {
        function SourceTermQuery(term) {
            this.term = term;
        }
        SourceTermQuery.prototype.build = function () {
            return {
                query: {
                    term: {
                        "typeestab.raw": this.term
                    }
                }
            };
        };
        return SourceTermQuery;
    })();
    gogeo.SourceTermQuery = SourceTermQuery;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var DashboardQuery = (function () {
        function DashboardQuery($http, geomSpace) {
            this.$http = $http;
            this.requestData = {};
            this.requestData = {
                agg_size: gogeo.Configuration.getAggSize(),
                field: gogeo.Configuration.getAggField(),
                geom: geomSpace,
                q: {
                    query: {
                        bool: {
                            must: []
                        }
                    }
                }
            };
        }
        DashboardQuery.prototype.getOrCreateAndRestriction = function (filter) {
            // var and = filter["and"];
            // if (!and) {
            //   and = filter.and = {
            //     filters: []
            //   };
            // }
            // return and;
        };
        DashboardQuery.prototype.filterBySearchTerms = function (terms) {
            // for (var i = 0; i < terms.length; i++) {
            //   this.filterBySearchTerm(terms[i]);
            // }
        };
        DashboardQuery.prototype.filterBySearchTerm = function (term) {
            // Enumerable.from(term.split(' '))
            //   .select(entry => entry.trim())
            //   .where(entry => entry != null && entry.length > 0)
            //   .forEach(entry => {
            //     switch (entry.charAt(0)) {
            //       case "@":
            //         this.filterByUsername(entry.substring(1));
            //         break;
            //       case "#":
            //         this.filterByHashtag({
            //           key: entry.substring(1),
            //           doc_count: 0
            //         });
            //         break;
            //       default:
            //         this.filterByText(term);
            //         break;
            //     }
            //   });
        };
        DashboardQuery.prototype.filterByHashtag = function (hashtag) {
            // var filter:any = this.requestData.q.query.filtered.filter;
            // if (hashtag) {
            //   this.requestData["field"] = "place.full_name.raw";
            //   this.requestData["agg_size"] = 5;
            //   var and = this.getOrCreateAndRestriction(filter);
            //   var queryString = new TextQueryBuilder(TextQueryBuilder.HashtagText, hashtag.key);
            //   and.filters.push(queryString.build());
            // }
        };
        DashboardQuery.prototype.filterByUsername = function (username) {
            // var filter:any = this.requestData.q.query.filtered.filter;
            // var and = this.getOrCreateAndRestriction(filter);
            // var queryString = new TextQueryBuilder(TextQueryBuilder.UserScreenName, username + "*");
            // and.filters.push(queryString.build());
        };
        DashboardQuery.prototype.filterByText = function (text) {
            // var filter:any = this.requestData.q.query.filtered.filter;
            // var and = this.getOrCreateAndRestriction(filter);
            // var queryString = new TextQueryBuilder(TextQueryBuilder.Text, text);
            // and.filters.push(queryString.build());
        };
        DashboardQuery.prototype.filterByPlace = function (text) {
            var must = this.getMust();
            var placeQueryString = new gogeo.TextQueryBuilder(gogeo.TextQueryBuilder.Place, text);
            console.log("placeQueryString", JSON.stringify(placeQueryString.build(), null, 2));
            // var filter:any = this.requestData.q.query.filtered.filter;
            // var and = this.getOrCreateAndRestriction(filter);
            // var queryString = new TextQueryBuilder(TextQueryBuilder.Place, text);
            // var boolQuery = new BoolQuery();
            // boolQuery.addMustQuery(queryString);
            // and.filters.push(boolQuery.build());
        };
        DashboardQuery.prototype.filterByDateRange = function (range) {
            var must = this.getMust();
            var dateRangeQuery = new gogeo.DateRangeQueryBuilder(gogeo.DateRangeQueryBuilder.DateRange, range);
            must.push(dateRangeQuery.build());
        };
        DashboardQuery.prototype.getMust = function () {
            return this.requestData.q.query.bool.must;
        };
        DashboardQuery.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "?mapkey=123");
            // console.log("this.requestData", JSON.stringify(this.requestData, null, 2));
            return this.$http
                .post(url, this.requestData)
                .success(resultHandler);
        };
        return DashboardQuery;
    })();
    gogeo.DashboardQuery = DashboardQuery;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeosearch = (function () {
        function GogeoGeosearch($http, geom, buffer, measure_buffer, fields, limit, query) {
            this.$http = $http;
            this.requestData = {};
            this.geom = null;
            this.buffer = 0;
            this.measure_buffer = null;
            this.q = {};
            this.limit = 0;
            this.fields = [];
            this.geom = geom;
            this.buffer = buffer;
            this.measure_buffer = measure_buffer;
            this.fields = fields;
            this.limit = limit;
            this.q = angular.toJson(query);
        }
        GogeoGeosearch.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geosearch/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "?mapkey=123");
            this.requestData = {
                geom: this.geom,
                limit: this.limit,
                buffer: this.buffer,
                measure_buffer: this.measure_buffer,
                fields: this.fields,
                q: this.q
            };
            return this.$http
                .post(url, this.requestData)
                .success(resultHandler);
        };
        return GogeoGeosearch;
    })();
    gogeo.GogeoGeosearch = GogeoGeosearch;
})(gogeo || (gogeo = {}));
var gogeo;
(function (gogeo) {
    var GogeoGeoagg = (function () {
        function GogeoGeoagg($http, size) {
            this.$http = $http;
            this.q = {
                aggs: {},
                size: 0
            };
            if (size) {
                this.q.size = size;
            }
        }
        GogeoGeoagg.prototype.addAgg = function (aggName, aggType, field) {
            this.q = {
                aggName: {
                    aggType: {
                        field: field
                    }
                }
            };
        };
        GogeoGeoagg.prototype.execute = function (resultHandler) {
            var url = gogeo.Configuration.makeUrl("geoagg/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "?mapkey=123");
            var requestData = {
                q: this.q
            };
            return this.$http
                .post(url, requestData)
                .success(resultHandler);
        };
        return GogeoGeoagg;
    })();
    gogeo.GogeoGeoagg = GogeoGeoagg;
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var MetricsService = (function () {
        function MetricsService($scope, $location, angularytics, service) {
            this.$scope = $scope;
            this.$location = $location;
            this.angularytics = angularytics;
            this.service = service;
            this._lastGeom = null;
            this._lastBucketResult = null;
            this._lastTerms = null;
            this._lastDateRange = null;
            this._lastPlace = null;
            this.firstGeom = false;
            this.firstBucket = false;
            this.firstTerms = false;
            this.firstDate = false;
            this.firstPlace = false;
            this.firstThematic = false;
            this.firstMapType = false;
            this.initialize();
            if (this.$location.host().match("gogeo.io")) {
                this.angularytics.trackPageView("/");
            }
        }
        MetricsService.prototype.initialize = function () {
            var _this = this;
            this.service.geomSpaceObservable
                .subscribeAndApply(this.$scope, function (geom) { return _this.publishGeomMetric(geom); });
            this.service.hashtagFilterObservable
                .subscribeAndApply(this.$scope, function (bucketResult) { return _this.publishHashtagMetric(bucketResult); });
            this.service.somethingTermsObservable
                .subscribeAndApply(this.$scope, function (terms) { return _this.publishWhatMetric(terms); });
            this.service.dateRangeObsersable
                .subscribeAndApply(this.$scope, function (dateRange) { return _this.publishWhenMetric(dateRange); });
            this.service.placeObservable
                .subscribeAndApply(this.$scope, function (place) { return _this.publishWhereMetric(place); });
            this.service.tweetObservable
                .subscribeAndApply(this.$scope, function (tweet) {
                _this.publishPopupMetric(tweet);
            });
        };
        MetricsService.prototype.publishGeomMetric = function (geom) {
            this._lastGeom = geom;
            if (!this.firstGeom) {
                this.firstGeom = true;
                return;
            }
            if (geom && geom.source === "draw") {
                this.publishMetric("geom", "geom", "geom");
            }
        };
        MetricsService.prototype.publishHashtagMetric = function (bucketResult) {
            this._lastBucketResult = bucketResult;
            if (!this.firstBucket) {
                this.firstBucket = true;
                return;
            }
            if (!bucketResult) {
                return;
            }
            this.publishMetric("hashtag", "click", bucketResult.key);
        };
        MetricsService.prototype.publishWhereMetric = function (place) {
            this._lastPlace = place;
            if (!this.firstPlace) {
                this.firstPlace = true;
                return;
            }
            if (this.validateParam(place)) {
                this.publishMetric("where", "where", place);
            }
        };
        MetricsService.prototype.publishWhatMetric = function (terms) {
            this._lastTerms = terms;
            if (!this.firstTerms) {
                this.firstTerms = true;
                return;
            }
            if (this.validateParam(terms)) {
                this.publishMetric("query", "query", terms.join(" "));
            }
        };
        MetricsService.prototype.publishWhenMetric = function (dateRange) {
            this._lastDateRange = dateRange;
            if (!this.firstDate) {
                this.firstDate = true;
                return;
            }
            if (!dateRange) {
                return;
            }
            var label = this.getDateLabel(dateRange);
            this.publishMetric("when", "when", label);
        };
        MetricsService.prototype.publishThematicMetric = function (selectedLayers) {
            if (!this.firstThematic) {
                this.firstThematic = true;
                return;
            }
            this.publishMetric("thematic", "thematic", selectedLayers.join(" "));
        };
        MetricsService.prototype.publishMapTypeMetric = function (type) {
            if (!this.firstMapType) {
                this.firstMapType = true;
                return;
            }
            this.publishMetric("mapType", "mapType", type);
        };
        MetricsService.prototype.publishPopupMetric = function (tweet) {
            if (!tweet || tweet.length == 0) {
                return;
            }
            var labels = [];
            if (this._lastBucketResult) {
                labels.push("hashtag: " + this._lastBucketResult.key);
            }
            if (this.validateParam(this._lastTerms)) {
                labels.push("what: " + this._lastTerms.join(" "));
            }
            if (this._lastDateRange) {
                labels.push("when: " + this.getDateLabel(this._lastDateRange));
            }
            if (this._lastPlace) {
                labels.push("where: " + this._lastPlace);
            }
            this.publishMetric("popup", "popup", labels.join(" | "));
        };
        MetricsService.prototype.publishSwitchBaseLayer = function (baseLayer) {
            this.publishMetric("baseLayer", "baseLayer", baseLayer);
        };
        MetricsService.prototype.publishMetric = function (action, category, label) {
            if (this.$location.host().match("gogeo.io")) {
                this.angularytics.trackEvent(action, category, label);
            }
            else {
                console.debug("publish metric", action, "category:", category, "label:", label);
            }
        };
        MetricsService.prototype.validateParam = function (param) {
            return param && param.length > 0;
        };
        MetricsService.prototype.getDateLabel = function (dateRange) {
            var label = "";
            if (dateRange.start) {
                label = "start: " + moment(dateRange.start).format("YYYY-MM-DD");
            }
            if (dateRange.end) {
                label = label + " end: " + moment(dateRange.end).format("YYYY-MM-DD");
            }
            return label;
        };
        MetricsService.$named = "metricsService";
        MetricsService.$inject = [
            "$rootScope",
            "$location",
            "Angularytics",
            "dashboardService"
        ];
        return MetricsService;
    })();
    gogeo.MetricsService = MetricsService;
    gogeo.registerService(MetricsService);
})(gogeo || (gogeo = {}));
///<reference path="../../shell.ts" />
///<reference path="../../shared/controls/queries.ts"/>
///<reference path="../../shared/controls/dashboard-query.ts"/>
///<reference path="../../shared/controls/gogeo-geosearch.ts"/>
///<reference path="../../shared/controls/gogeo-geoagg.ts"/>
///<reference path="./metrics.ts"/>
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardService = (function () {
        function DashboardService($q, $http, $location, $timeout, $routeParams) {
            this.$q = $q;
            this.$http = $http;
            this.$location = $location;
            this.$timeout = $timeout;
            this.$routeParams = $routeParams;
            this._lastGeomSpace = null;
            this._lastHashtagFilter = null;
            this._lastSomethingTerms = [];
            this._lastPlaceString = null;
            this._lastDateRange = null;
            this._lastMapCenter = null;
            this._lastMapZoom = 0;
            this._lastMapType = null;
            this._lastMapBase = null;
            this._loading = true;
            this.worldBound = {
                type: "Polygon",
                coordinates: [
                    [
                        [
                            -201.09375,
                            -81.97243132048264
                        ],
                        [
                            -201.09375,
                            84.86578186731522
                        ],
                        [
                            201.09375,
                            84.86578186731522
                        ],
                        [
                            201.09375,
                            -81.97243132048264
                        ],
                        [
                            -201.09375,
                            -81.97243132048264
                        ]
                    ]
                ]
            };
            this._geomSpaceObservable = new Rx.BehaviorSubject(null);
            this._hashtagFilterObservable = new Rx.BehaviorSubject(null);
            this._somethingTermsObservable = new Rx.BehaviorSubject([]);
            this._placeObservable = new Rx.BehaviorSubject(null);
            this._hashtagResultObservable = new Rx.BehaviorSubject(null);
            this._dateRangeObservable = new Rx.BehaviorSubject(null);
            this._lastQueryObservable = new Rx.BehaviorSubject(null);
            this._tweetObservable = new Rx.BehaviorSubject(null);
            this._dateLimitObservable = new Rx.BehaviorSubject(null);
            this._placeBoundObservable = new Rx.BehaviorSubject(null);
            this._loadParamsObservable = new Rx.BehaviorSubject(null);
            this.initialize();
            this.getDateRange();
            this.loadParams();
        }
        DashboardService.prototype.loadParams = function () {
            var _this = this;
            this._loadParamsObservable.onNext(this.$routeParams);
            this.$timeout(function () {
                _this.$location.search({});
            }, 200);
        };
        Object.defineProperty(DashboardService.prototype, "loading", {
            get: function () {
                return this._loading;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.isLoading = function () {
            return this._loading;
        };
        Object.defineProperty(DashboardService.prototype, "geomSpaceObservable", {
            get: function () {
                return this._geomSpaceObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "hashtagResultObservable", {
            get: function () {
                return this._hashtagResultObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "hashtagFilterObservable", {
            get: function () {
                return this._hashtagFilterObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "queryObservable", {
            get: function () {
                return this._lastQueryObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "dateRangeObsersable", {
            get: function () {
                return this._dateRangeObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "somethingTermsObservable", {
            get: function () {
                return this._somethingTermsObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "placeObservable", {
            get: function () {
                return this._placeObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "tweetObservable", {
            get: function () {
                return this._tweetObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "dateLimitObservable", {
            get: function () {
                return this._dateLimitObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "placeBoundObservable", {
            get: function () {
                return this._placeBoundObservable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardService.prototype, "loadParamsObservable", {
            get: function () {
                return this._loadParamsObservable;
            },
            enumerable: true,
            configurable: true
        });
        DashboardService.prototype.initialize = function () {
            var _this = this;
            Rx.Observable
                .merge(this._geomSpaceObservable, this._hashtagFilterObservable, this._dateRangeObservable)
                .throttle(400)
                .subscribe(function () { return _this.search(); });
            Rx.Observable
                .merge(this._somethingTermsObservable, this._placeObservable)
                .throttle(800)
                .subscribe(function () { return _this.search(); });
        };
        DashboardService.prototype.calculateNeSW = function (bounds) {
            var ne = new L.LatLng(bounds.getNorthEast().lng, bounds.getNorthEast().lat);
            var sw = new L.LatLng(bounds.getSouthWest().lng, bounds.getSouthWest().lat);
            return new gogeo.NeSwPoint(ne, sw);
        };
        DashboardService.prototype.pointToGeoJson = function (point) {
            var ne = [point.ne.lat, point.ne.lng];
            var sw = [point.sw.lat, point.sw.lng];
            var nw = [sw[0], ne[1]];
            var se = [ne[0], sw[1]];
            var coordinates = [
                [
                    sw, nw, ne, se, sw
                ]
            ];
            return {
                source: "mapBounds",
                type: "Polygon",
                coordinates: coordinates
            };
        };
        DashboardService.prototype.createShareLink = function (type) {
            var url = "?share";
            // if (this._lastPlaceString && this._lastPlaceCode) {
            //   url = url + "&where=" + this._lastPlaceString;
            // } else {
            //   if (this._lastMapCenter) {
            //     var point = this._lastMapCenter;
            //     var lat = point.lat.toFixed(2);
            //     var lng = point.lng.toFixed(2);
            //     url = url + "&center=" + lat + "," + lng;
            //   }
            //   if (this._lastMapZoom) {
            //     url = url + "&zoom=" + this._lastMapZoom;
            //   }
            // }
            // if (this._lastDateRange.start) {
            //   var dateFormatted = moment(this._lastDateRange.start).format("MM/DD/YYYY");
            //   url = url + "&startDate=" + dateFormatted;
            // }
            // if (this._lastDateRange.end) {
            //   var dateFormatted = moment(this._lastDateRange.end).format("MM/DD/YYYY");
            //   url = url + "&endDate=" + dateFormatted;
            // }
            // if (this._lastSomethingTerms) {
            //   var terms = [];
            //   for (var index in this._lastSomethingTerms) {
            //     var term = this._lastSomethingTerms[index];
            //     term = term.replace("#", "%23");
            //     terms.push(term);
            //   }
            //   url = url + "&what=" + terms.join(" ");
            // }
            // if (this._lastMapType) {
            //   url = url + "&type=" + this._lastMapType;
            // }
            // if (this._lastMapBase) {
            //   url = url + "&baseLayer=" + this._lastMapBase;
            // }
            // url = "http://twittermap.gogeo.io/app/#/dashboard" + url;
            // var shortenUrl = Configuration.getShortenUrl() + "?url=" + encodeURIComponent(url);
            // this.$http.get(shortenUrl).then((result: any) => {
            //   var tweetUrl = result.data["data"]["url"];
            //   this.openShare(type, tweetUrl);
            // }, (data: any) => {
            //   this.openShare(type, url);
            // });
            return url;
        };
        DashboardService.prototype.openShare = function (type, url) {
            // if (type === "twitter") {
            //   this.twitterShare(url);
            // } else if (type === "facebook") {
            //   this.facebookShare(url);
            // }
        };
        DashboardService.prototype.twitterShare = function (url) {
            // var params = [
            //   "url=" + encodeURIComponent(url),
            //   "via=gogeo_io",
            //   "hashtags=gogeo,gogeo_io,twittermap",
            //   "text=" + encodeURIComponent("Check out the live tweets on the map")
            // ];
            // var url = 'http://twitter.com/share?' + params.join("&");
            // var sharePopOptions = 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0';
            // window.open(url, 'twitterwindow', sharePopOptions);
        };
        DashboardService.prototype.facebookShare = function (url) {
            // var params = [
            //   "app_id=873202776080901",
            //   "sdk=joey",
            //   "u=" + encodeURIComponent(url),
            //   "display=popup",
            //   "ref=plugin",
            //   "src=share_button"
            // ];
            // var url = 'https://www.facebook.com/sharer/sharer.php?' + params.join("&");
            // var sharePopOptions = 'height=450, width=650, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0';
            // window.open(url, 'facebookwindow', sharePopOptions);
        };
        DashboardService.prototype.updateGeomSpace = function (geom) {
            this._loading = true;
            this._lastGeomSpace = geom;
            this._geomSpaceObservable.onNext(geom);
        };
        DashboardService.prototype.updateGeomSpaceByBounds = function (bounds) {
            var point = this.calculateNeSW(bounds);
            var geomSpace = this.pointToGeoJson(point);
            if (geomSpace) {
                this.updateGeomSpace(geomSpace);
            }
        };
        DashboardService.prototype.updateHashtagBucket = function (bucket) {
            this._loading = true;
            this._lastHashtagFilter = bucket;
            this._hashtagFilterObservable.onNext(bucket);
        };
        DashboardService.prototype.updateSomethingTerms = function (terms) {
            this._loading = true;
            this._lastSomethingTerms = terms;
            this._somethingTermsObservable.onNext(terms);
        };
        DashboardService.prototype.updatePlace = function (place) {
            if (place) {
                this._lastPlaceString = place;
            }
            else {
                this._lastPlaceString = null;
            }
            this._placeObservable.onNext(this._lastPlaceString);
        };
        DashboardService.prototype.updateDateRange = function (startDate, endDate) {
            var dateRange = null;
            if (startDate || endDate) {
                dateRange = { start: startDate, end: endDate };
            }
            this._lastDateRange = dateRange;
            this._dateRangeObservable.onNext(dateRange);
        };
        DashboardService.prototype.updateMapCenter = function (mapCenter) {
            this._lastMapCenter = mapCenter;
        };
        DashboardService.prototype.updateMapZoom = function (mapZoom) {
            this._lastMapZoom = mapZoom;
        };
        DashboardService.prototype.updateMapType = function (mapType) {
            this._lastMapType = mapType;
        };
        DashboardService.prototype.updateMapBase = function (mapBase) {
            this._lastMapBase = mapBase;
        };
        DashboardService.prototype.getTransaction = function (latlng, zoom, thematicQuery) {
            return this.getTransactionData(latlng, zoom, thematicQuery);
        };
        DashboardService.prototype.getDateRange = function () {
            var _this = this;
            if (!this.$location.search()["startDate"] && !this.$location.search()["endDate"]) {
                this.$http.get(gogeo.Configuration.getDateRangeUrl()).then(function (result) {
                    _this._dateLimitObservable.onNext(result.data);
                });
            }
        };
        DashboardService.prototype.getDateHistogramAggregation = function () {
            var url = gogeo.Configuration.makeUrl("aggregations/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "/date_histogram");
            var q = this.composeQuery().requestData.q;
            // console.log("->", JSON.stringify(q, null, 2));
            var options = {
                params: {
                    mapkey: gogeo.Configuration.getMapKey(),
                    field: gogeo.Configuration.getDateField(),
                    summary: gogeo.Configuration.getAggSummary(),
                    interval: gogeo.Configuration.getInterval(),
                    date_format: "YYYY-MM-DD",
                    q: JSON.stringify(q)
                }
            };
            return this.$http.get(url, options);
        };
        DashboardService.prototype.getStatsAggregationSummary = function () {
            var field = gogeo.Configuration.getAggChartField();
            var groupBy = gogeo.Configuration.getSummaryGroupBy();
            return this.getStatsAggregation(field, groupBy);
        };
        DashboardService.prototype.getStatsAggregationTypePay = function () {
            var field = gogeo.Configuration.getAggChartField();
            var groupBy = gogeo.Configuration.getTypePayGroupBy();
            return this.getStatsAggregation(field, groupBy);
        };
        DashboardService.prototype.getStatsAggregationTypeEstab = function () {
            var field = gogeo.Configuration.getAggChartField();
            var groupBy = gogeo.Configuration.getTypeEstabGroupBy();
            return this.getStatsAggregation(field, groupBy);
        };
        DashboardService.prototype.getStatsAggregation = function (field, groupBy) {
            var url = gogeo.Configuration.makeUrl("aggregations/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "/stats");
            var q = this.composeQuery().requestData.q;
            // console.log("->", JSON.stringify(q, null, 2));
            var options = {
                params: {
                    mapkey: gogeo.Configuration.getMapKey(),
                    field: field,
                    group_by: groupBy,
                    q: JSON.stringify(q)
                }
            };
            return this.$http.get(url, options);
        };
        DashboardService.prototype.getTransactionData = function (latlng, zoom, thematicQuery) {
            var _this = this;
            var url = gogeo.Configuration.makeUrl("geosearch/" + gogeo.Configuration.getDatabaseName() + "/" + gogeo.Configuration.getCollectionName() + "?mapkey=123");
            var pixelDist = 2575 * Math.cos((latlng.lat * Math.PI / 180)) / Math.pow(2, (zoom + 8));
            var query = this.composeQuery().requestData.q;
            if (thematicQuery) {
                query = thematicQuery.build();
            }
            var geom = {
                type: "Point",
                coordinates: [
                    latlng.lng, latlng.lat
                ]
            };
            var geosearch = new gogeo.GogeoGeosearch(this.$http, geom, pixelDist, "degree", gogeo.Configuration.tweetFields(), 1, query);
            geosearch.execute(function (result) {
                _this._tweetObservable.onNext(result);
            });
        };
        DashboardService.prototype.totalTweets = function () {
            var url = gogeo.Configuration.getTotalTweetsUrl();
            return this.$http.get(url);
        };
        DashboardService.prototype.search = function () {
            var _this = this;
            if (!this._lastGeomSpace) {
                return;
            }
            this._loading = true;
            var query = this.composeQuery();
            query.execute(function (result) {
                _this._loading = false;
                _this._hashtagResultObservable.onNext(result);
            });
            this._lastQueryObservable.onNext(query.requestData.q);
        };
        DashboardService.prototype.composeQuery = function () {
            var query = new gogeo.DashboardQuery(this.$http, this._lastGeomSpace);
            // if (this._lastHashtagFilter) {
            //   query.filterByHashtag(this._lastHashtagFilter);
            // }
            // @robertogyn19, goiânia, #gogeoio
            if (this._lastSomethingTerms.length > 0) {
                query.filterBySearchTerms(this._lastSomethingTerms);
            }
            if (this._lastPlaceString) {
                query.filterByPlace(this._lastPlaceString);
            }
            if (this._lastDateRange) {
                query.filterByDateRange(this._lastDateRange);
            }
            return query;
        };
        DashboardService.$named = "dashboardService";
        DashboardService.$inject = [
            "$q",
            "$http",
            "$location",
            "$timeout",
            "$routeParams"
        ];
        return DashboardService;
    })();
    gogeo.DashboardService = DashboardService;
    gogeo.registerService(DashboardService);
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var gogeo;
(function (gogeo) {
    var DashboardDetailsController = (function () {
        function DashboardDetailsController($scope, $interval, $filter, service) {
            this.$scope = $scope;
            this.$interval = $interval;
            this.$filter = $filter;
            this.service = service;
            this.hashtagResult = null;
            this.selectedHashtag = null;
        }
        DashboardDetailsController.prototype.initialize = function () {
            var _this = this;
            this.service.hashtagResultObservable
                .subscribeAndApply(this.$scope, function (result) { return _this.handleResult(result); });
        };
        DashboardDetailsController.prototype.handleResult = function (result) {
            this.hashtagResult = result;
            if (this.selectedHashtag) {
                this.selectedHashtag.doc_count = result.doc_total;
            }
        };
        DashboardDetailsController.prototype.unselect = function () {
            this.selectedHashtag = null;
            this.service.updateHashtagBucket(null);
        };
        DashboardDetailsController.$inject = [
            "$scope",
            "$interval",
            "$filter",
            gogeo.DashboardService.$named
        ];
        return DashboardDetailsController;
    })();
    gogeo.registerDirective("dashboardDetails", function () {
        return {
            restrict: "CE",
            templateUrl: "dashboard/controls/dashboard-details-template.html",
            controller: DashboardDetailsController,
            controllerAs: "details",
            bindToController: true,
            scope: true,
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/**
 * Created by danfma on 06/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardHashtagsController = (function () {
        function DashboardHashtagsController($scope, service) {
            var _this = this;
            this.$scope = $scope;
            this.service = service;
            this.buckets = [];
            this.selectedHashtag = null;
            this.message = null;
            this.message = "Top 10 hashtags";
            this.service.hashtagResultObservable
                .subscribeAndApply(this.$scope, function (result) {
                if (result && result["buckets_qtd"] == 10) {
                    _this.message = "Top 10 hashtags";
                }
            });
        }
        DashboardHashtagsController.prototype.hasSelected = function () {
            return this.selectedHashtag != null;
        };
        DashboardHashtagsController.prototype.selectHashtag = function (bucket) {
            this.message = "Top 5 places for this hashtag";
            this.selectedHashtag = bucket;
            this.service.updateHashtagBucket(bucket);
        };
        DashboardHashtagsController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardHashtagsController;
    })();
    gogeo.DashboardHashtagsController = DashboardHashtagsController;
    gogeo.registerDirective("dashboardHashtags", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/dashboard-hashtags-template.html",
            controller: DashboardHashtagsController,
            controllerAs: "hashtags",
            bindToController: true,
            scope: {
                buckets: "=",
                selectedHashtag: "="
            },
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../shared/abstract-controller.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var gogeo;
(function (gogeo) {
    var DashboardController = (function (_super) {
        __extends(DashboardController, _super);
        function DashboardController($scope, service) {
            var _this = this;
            _super.call(this, $scope);
            this.service = service;
            this.startDate = null;
            this.endDate = null;
            this.dateFormat = "MM/DD/YYYY";
            this.initialize();
            this.service.dateLimitObservable
                .subscribeAndApply(this.$scope, function (result) {
                if (result) {
                    _this.startDate = moment(new Date(result["max"])).subtract(15, "days").format("MM/DD/YYYY");
                    _this.endDate = moment(new Date(result["max"])).format("MM/DD/YYYY");
                }
            });
            this.service.loadParamsObservable
                .subscribeAndApply(this.$scope, function (result) {
                _this.loadParams(result);
            });
        }
        DashboardController.prototype.loadParams = function (result) {
            if (!result || JSON.stringify(result) === JSON.stringify({})) {
                return;
            }
            var what = result["what"];
            if (what) {
                this.somethingTerm = what;
                this.service.updateSomethingTerms([this.somethingTerm]);
            }
            var where = result["where"];
            if (where) {
                this.place = where;
                this.service.updatePlace(this.place);
            }
            var startDate = result["startDate"];
            var endDate = result["endDate"];
            if (startDate || endDate) {
                if (startDate) {
                    this.startDate = startDate;
                }
                if (endDate) {
                    this.endDate = endDate;
                }
                this.service.updateDateRange(new Date(Date.parse(this.startDate)), new Date(Date.parse(this.endDate)));
            }
        };
        DashboardController.prototype.initialize = function () {
            var _this = this;
            _super.prototype.initialize.call(this);
            this.watchAsObservable("somethingTerm")
                .skip(1)
                .throttle(800)
                .select(function (term) {
                return Enumerable
                    .from(term.split(" "))
                    .select(function (part) { return part.trim(); })
                    .toArray();
            })
                .subscribe(function (terms) { return _this.service.updateSomethingTerms(terms); });
            this.watchAsObservable("place")
                .skip(1)
                .throttle(800)
                .subscribe(function (place) { return _this.service.updatePlace(place); });
            Rx.Observable.merge(this.watchAsObservable("startDate"), this.watchAsObservable("endDate"))
                .skip(1)
                .throttle(400)
                .subscribe(function (range) {
                var startDate = null;
                var endDate = null;
                if (_this.startDate) {
                    startDate = new Date(Date.parse(_this.startDate));
                }
                if (_this.endDate) {
                    endDate = new Date(Date.parse(_this.endDate));
                }
                _this.service.updateDateRange(startDate, endDate);
            });
        };
        DashboardController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DashboardController;
    })(gogeo.AbstractController);
    gogeo.registerDirective("dashboardHeader", function () {
        return {
            restrict: "C",
            templateUrl: "dashboard/controls/dashboard-header-template.html",
            controller: DashboardController,
            controllerAs: "header",
            bindToController: true,
            scope: true
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-events.ts" />
/// <reference path="../services/dashboard-service.ts" />
/// <reference path="../services/metrics.ts" />
/**
 * Created by danfma on 07/03/15.
 */
var gogeo;
(function (gogeo) {
    var DashboardMapController = (function () {
        function DashboardMapController($scope, $cookies, $timeout, $location, linkify, $sce, $geo, service, metrics) {
            this.$scope = $scope;
            this.$cookies = $cookies;
            this.$timeout = $timeout;
            this.$location = $location;
            this.linkify = linkify;
            this.$sce = $sce;
            this.$geo = $geo;
            this.service = service;
            this.metrics = metrics;
            this.query = { query: { filtered: { filter: {} } } };
            this.selected = "inactive";
            this.mapTypes = ["point", "cluster", "intensity", "thematic"];
            this.mapSelected = "point";
            this.drawing = false;
            this.baseLayers = null;
            this.layerGroup = null;
            this.drawnItems = null;
            this.drawnGeom = null;
            this.restricted = false;
            this.canOpenPopup = true;
            this.thematicMaps = {};
            this.baseLayerSelected = "day";
            this.levent = null;
            this.thematicSelectedLayers = [
                "restaurantes", "informatica", "alimentos", "construcao", "farmaceutico", "combustiveis", "hoteis"
            ];
            // queries: any = {
            //     android: '<a href="http://twitter.com/download/android" rel="nofollow">Twitter for Android</a>',
            //     iphone: '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>',
            //     web: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
            //     instagram: '<a href="http://instagram.com" rel="nofollow">Instagram</a>',
            //     foursquare: '<a href="http://foursquare.com" rel="nofollow">Foursquare</a>',
            //     others: ''
            // }
            this.queries = {
                restaurantes: "Restaurantes e outros serviços de alimentação e bebidas",
                informatica: "Comércio varejista de equipamentos de informática e comunicação",
                alimentos: "Comércio varejista de produtos alimentícios, bebidas e fumo",
                construcao: "Comércio varejista de material de construção",
                farmaceutico: "Comércio varejista de produtos farmacêuticos, perfumaria e cosméticos e artigos médicos, ópticos e ortopédicos",
                combustiveis: "Comércio varejista de combustíveis para veículos automotores",
                hoteis: "Hotéis e similares",
            };
            this._thematicLayers = new Rx.BehaviorSubject(this.thematicSelectedLayers);
            this._selectedMap = new Rx.BehaviorSubject(null);
            this.layerGroup = L.layerGroup([]);
            this.baseLayers = L.featureGroup([]);
        }
        Object.defineProperty(DashboardMapController.prototype, "thematicLayers", {
            get: function () {
                return this._thematicLayers;
            },
            enumerable: true,
            configurable: true
        });
        DashboardMapController.prototype.initialize = function (map) {
            var _this = this;
            this.map = map;
            this.baseLayers.addLayer(this.getDayMap());
            this.map.addLayer(this.baseLayers);
            this.map.on("moveend", function (e) { return _this.onMapLoaded(); });
            this.map.on("click", function (e) { return _this.openPopup(e); });
            this.map.on("draw:created", function (e) { return _this.drawnHandler(e); });
            this.map.on("draw:deleted", function (e) { return _this.drawnHandler(e); });
            this.map.on("draw:edited", function (e) { return _this.drawnHandler(e); });
            this.map.on("draw:editstart", function (e) { return _this.blockPopup(); });
            this.map.on("draw:editstop", function (e) { return _this.allowPopup(); });
            this.map.on("draw:deletestart", function (e) { return _this.blockPopup(); });
            this.map.on("draw:deletestop", function (e) { return _this.allowPopup(); });
            this.initializeLayer();
            this.drawnItems = new L.FeatureGroup();
            this.map.addLayer(this.drawnItems);
            this.initializeDrawControl();
            this.service.geomSpaceObservable
                .subscribeAndApply(this.$scope, function (geom) { return _this.handleGeom(geom); });
            this.service.placeBoundObservable
                .where(function (bound) { return bound != null; })
                .subscribeAndApply(this.$scope, function (bound) { return _this.fitMap(bound); });
            this.service.loadParamsObservable
                .subscribeAndApply(this.$scope, function (result) {
                _this.loadParams(result);
            });
            Rx.Observable
                .merge(this._thematicLayers)
                .throttle(800)
                .subscribe(function () {
                _this.metrics.publishThematicMetric(_this.thematicSelectedLayers);
            });
            Rx.Observable
                .merge(this._selectedMap)
                .throttle(800)
                .subscribe(function () {
                _this.service.updateMapType(_this.mapSelected);
                _this.metrics.publishMapTypeMetric(_this.mapSelected);
            });
            if (!this.$location.search()["center"] && !this.$location.search()["zoom"]) {
                var shareLocation = (this.$cookies["gogeo.shareLocation"] === "true");
                if (this.$cookies["gogeo.firstLoad"] == undefined || shareLocation) {
                    this.$cookies["gogeo.firstLoad"] = false;
                    if (!shareLocation) {
                        this.$cookies["gogeo.shareLocation"] = false;
                    }
                    this.setGeoLocation();
                }
            }
        };
        DashboardMapController.prototype.loadParams = function (result) {
            if (!result || JSON.stringify(result) === JSON.stringify({})) {
                return;
            }
            var zoom = parseInt(result["zoom"]);
            if (zoom) {
                this.map.setZoom(zoom);
            }
            var centerString = result["center"];
            if (centerString) {
                centerString = centerString.split(",");
                if (centerString.length != 2) {
                    // Compatibility with previous version
                    centerString = centerString.split(";");
                }
                var lat = parseFloat(centerString[0]);
                var lng = parseFloat(centerString[1]);
                var center = new L.LatLng(lat, lng);
                this.map.setView(center);
            }
            var mapType = result["type"];
            if (mapType && this.mapTypes.indexOf(mapType) != (-1)) {
                this.mapSelected = mapType;
            }
            var baseLayer = result["baseLayer"];
            if (baseLayer === "night") {
                this.switchBaseLayer();
            }
        };
        DashboardMapController.prototype.fitMap = function (bound) {
            console.log("--------- fitbound");
            this.map.fitBounds(bound, { reset: true });
        };
        DashboardMapController.prototype.initializeLayer = function () {
            var _this = this;
            this.map.addLayer(this.layerGroup);
            var layers = this.createLayers();
            for (var i in layers) {
                this.layerGroup.addLayer(layers[i]);
            }
            this.service.queryObservable
                .where(function (q) { return q != null; })
                .throttle(400)
                .subscribeAndApply(this.$scope, function (query) { return _this.queryHandler(query); });
            this.service.tweetObservable
                .subscribeAndApply(this.$scope, function (tweet) { return _this.handlePopupResult(tweet); });
        };
        DashboardMapController.prototype.setGeoLocation = function () {
            var _this = this;
            var shareLocation = (this.$cookies["gogeo.shareLocation"] === "true");
            if (shareLocation) {
                var latitude = this.$cookies["gogeo.location.lat"];
                var longitude = this.$cookies["gogeo.location.lng"];
                this.centerMap(latitude, longitude);
            }
            else {
                this.$geo.getCurrentPosition().then(function (location) {
                    var coords = location.coords;
                    _this.centerMap(coords.latitude, coords.longitude);
                    _this.$cookies["gogeo.shareLocation"] = "true";
                    _this.$cookies["gogeo.location.lat"] = coords.latitude;
                    _this.$cookies["gogeo.location.lng"] = coords.longitude;
                });
            }
        };
        DashboardMapController.prototype.centerMap = function (lat, lng) {
            if (lat && lng) {
                var center = new L.LatLng(lat, lng);
                this.map.setView(center, 12);
            }
        };
        DashboardMapController.prototype.getNightMap = function () {
            var mapOptions = {
                // How you would like to style the map. 
                // This is where you would paste any style found on Snazzy Maps.
                styles: [
                    { "stylers": [{ "visibility": "simplified" }] },
                    { "stylers": [{ "color": "#131314" }] },
                    {
                        "featureType": "water",
                        "stylers": [{ "color": "#131313" }, { "lightness": 7 }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "visibility": "on" }, { "lightness": 25 }]
                    }
                ]
            };
            var options = {
                mapOptions: mapOptions,
                maptiks_id: "night-map"
            };
            return new L.Google("ROADMAP", options);
        };
        DashboardMapController.prototype.getDayMap = function () {
            return new L.Google('ROADMAP', { maptiks_id: "day-map" });
        };
        DashboardMapController.prototype.blockPopup = function () {
            this.canOpenPopup = false;
        };
        DashboardMapController.prototype.allowPopup = function () {
            this.canOpenPopup = true;
        };
        DashboardMapController.prototype.handleGeom = function (geom) {
        };
        DashboardMapController.prototype.initializeDrawControl = function () {
            var drawOptions = {
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    marker: false,
                    rectangle: {
                        showArea: true,
                        shapeOptions: {
                            color: "blue"
                        }
                    }
                },
                edit: {
                    featureGroup: this.drawnItems
                },
                trash: true
            };
            var drawControl = new L.Control.Draw(drawOptions);
            this.map.addControl(drawControl);
        };
        DashboardMapController.prototype.queryHandler = function (query) {
            if (JSON.stringify(query) !== JSON.stringify(this.query)) {
                this.query = query;
                this.updateLayer();
            }
            else {
            }
        };
        DashboardMapController.prototype.drawnHandler = function (event) {
            var _this = this;
            var layerType = event["layerType"];
            var eventType = event["type"];
            var layer = event["layer"];
            if (!layer) {
                layer = this.drawnItems.getLayers()[0];
            }
            this.drawnItems.clearLayers();
            if (layer) {
                this.restricted = false;
                var geojson = layer.toGeoJSON();
                this.drawnItems.addLayer(layer);
                this.onMapLoaded(this.getDrawGeomSpace(geojson["geometry"]));
                layer.on("click", function (e) { return _this.openPopup(e); });
            }
            else {
                this.restricted = false;
                this.drawnGeom = null;
                this.updateLayer();
                this.onMapLoaded();
            }
        };
        DashboardMapController.prototype.getDrawGeomSpace = function (geojson) {
            return {
                source: "draw",
                type: geojson["type"],
                coordinates: geojson["coordinates"]
            };
        };
        DashboardMapController.prototype.createLayers = function () {
            var url = this.configureUrl();
            var options = {
                subdomains: gogeo.Configuration.subdomains,
                maptiks_id: this.mapSelected
            };
            if (["point", "intensity"].indexOf(this.mapSelected) != (-1)) {
                return [L.tileLayer(url, options)];
            }
            else if (this.mapSelected === "thematic") {
                return this.createThematicLayers(url, options);
            }
            else if (this.mapSelected === 'cluster') {
                return [this.createClusterLayer(url)];
            }
        };
        DashboardMapController.prototype.configureUrl = function () {
            var database = gogeo.Configuration.getDatabaseName();
            var collection = gogeo.Configuration.getCollectionName();
            var buffer = 8;
            var stylename = "gogeo_many_points";
            var serviceName = "tile.png";
            if (this.mapSelected === "cluster") {
                serviceName = "cluster.json";
            }
            if (this.mapSelected === "thematic") {
                stylename = "restaurantes_1";
            }
            if (this.mapSelected === "intensity") {
                stylename = "gogeo_intensity";
            }
            var url = "/map/"
                + database + "/" +
                collection + "/{z}/{x}/{y}/"
                + serviceName + "?buffer=" + buffer +
                "&stylename=" + stylename + "&mapkey=123";
            if (this.query) {
                url = url + "&q=" + encodeURIComponent(angular.toJson(this.query));
            }
            if (this.drawnGeom) {
                url = url + "&geom=" + angular.toJson(this.drawnGeom);
            }
            return gogeo.Configuration.makeUrl(url);
        };
        DashboardMapController.prototype.createThematicLayers = function (url, options) {
            var array = [];
            var layer = null;
            url = this.configureThematicUrl("restaurantes", "restaurantes_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["restaurantes"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("informatica", "informatica_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["informatica"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("alimentos", "alimentos_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["alimentos"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("construcao", "construcao_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["construcao"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("farmaceutico", "farmaceutico_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["farmaceutico"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("combustiveis", "combustiveis_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["combustiveis"] = layer;
            array.push(layer);
            url = this.configureThematicUrl("hoteis", "hoteis_1");
            layer = L.tileLayer(url, options);
            this.thematicMaps["hoteis"] = layer;
            array.push(layer);
            return array;
        };
        DashboardMapController.prototype.configureThematicUrl = function (term, stylename) {
            var originalQuery = this.query;
            if (term === 'others') {
                var thematicQuery = this.createThematicOthersQuery(this.query);
                this.query = thematicQuery.build();
            }
            else {
                var sourceTermQuery = new gogeo.SourceTermQuery(this.queries[term]);
                var thematicQuery = new gogeo.ThematicQuery([sourceTermQuery], this.query);
                this.query = thematicQuery.build();
            }
            ;
            var url = this.configureUrl();
            url = url.replace("restaurantes_1", stylename);
            this.query = originalQuery;
            return url;
        };
        DashboardMapController.prototype.createThematicOthersQuery = function (query) {
            var q1 = new gogeo.TextQueryBuilder(["source"], "*ipad*");
            var q2 = new gogeo.TextQueryBuilder(["source"], "*windows*");
            var q3 = new gogeo.TextQueryBuilder(["source"], "*jobs*");
            var q4 = new gogeo.TextQueryBuilder(["source"], "*mac*");
            var tq = null;
            if (query) {
                tq = new gogeo.ThematicQuery([q1, q2, q3, q4], query);
            }
            else {
                tq = new gogeo.ThematicQuery([q1, q2, q3, q4]);
            }
            return tq;
        };
        DashboardMapController.prototype.switchBaseLayer = function () {
            this.baseLayers.clearLayers();
            if (this.baseLayerSelected === "day") {
                this.baseLayerSelected = "night";
                this.baseLayers.addLayer(this.getNightMap());
            }
            else {
                this.baseLayerSelected = "day";
                this.baseLayers.addLayer(this.getDayMap());
            }
            this.service.updateMapBase(this.baseLayerSelected);
            this.metrics.publishSwitchBaseLayer(this.baseLayerSelected);
            this.baseLayers.bringToBack();
        };
        DashboardMapController.prototype.formatTweetText = function (text) {
            return this.$sce.trustAsHtml(this.linkify.twitter(text));
        };
        DashboardMapController.prototype.formatDate = function (dateString) {
            var date = new Date(dateString);
            return moment(date).utc().format("LLLL");
        };
        DashboardMapController.prototype.toggleThematicMap = function (id, layer) {
            if (this.layerGroup.hasLayer(layer)) {
                this.layerGroup.removeLayer(layer);
                this.thematicSelectedLayers.splice(this.thematicSelectedLayers.indexOf(id), 1);
            }
            else {
                this.layerGroup.addLayer(layer);
                this.thematicSelectedLayers.splice(0, 0, id);
            }
            this._thematicLayers.onNext(this.thematicSelectedLayers);
        };
        DashboardMapController.prototype.onMapLoaded = function (geom) {
            this.service.updateMapZoom(this.map.getZoom());
            this.service.updateMapCenter(this.map.getCenter());
            if (this.restricted) {
                return;
            }
            if (geom) {
                this.service.updateGeomSpace(geom);
                this.restricted = true;
                this.drawnGeom = geom;
                this.updateLayer();
            }
            else {
                this.service.updateGeomSpaceByBounds(this.map.getBounds());
            }
        };
        DashboardMapController.prototype.hidePopup = function () {
            this.map.closePopup(this.popup);
            this.tweetResult = null;
        };
        DashboardMapController.prototype.formatPictureUrl = function (url) {
            if (!url) {
                return url;
            }
            var url = url.replace("_normal", "");
            return url;
        };
        DashboardMapController.prototype.formatTweetUrl = function () {
            if (this.tweetResult) {
                var url = "https://twitter.com/";
                url = url + this.tweetResult["user.screen_name"] + "/";
                url = url + "status/";
                url = url + this.tweetResult["id"];
                return url;
            }
        };
        DashboardMapController.prototype.openPopup = function (levent) {
            var zoom = this.map.getZoom();
            var intersects = true;
            if (!this.canOpenPopup) {
                return;
            }
            if (this.drawnItems.getLayers().length > 0) {
                var layer = this.drawnItems.getLayers()[0];
                var bounds = layer.getBounds();
                var point = levent.latlng;
                intersects = bounds.contains(point);
            }
            if ((this.mapSelected === "point" || this.mapSelected === "thematic") && intersects) {
                var queries = [];
                for (var index in this.thematicMaps) {
                    var thematicLayer = this.thematicMaps[index];
                    if (this.layerGroup.hasLayer(thematicLayer)) {
                        var query = null;
                        if (index === 'others') {
                            query = this.createThematicOthersQuery().build();
                        }
                        else {
                            query = new gogeo.SourceTermQuery(this.queries[index]);
                        }
                        queries.push(query);
                    }
                }
                var thematicQuery = new gogeo.ThematicQuery(queries, this.query);
                this.service.getTransaction(levent.latlng, zoom, thematicQuery);
                this.levent = levent;
            }
        };
        DashboardMapController.prototype.handlePopupResult = function (result) {
            if (!result || result.length == 0) {
                return;
            }
            this.tweetResult = result[0];
            if (!this.tweetResult) {
                return;
            }
            if (this.popup == null) {
                var options = {
                    closeButton: false,
                    className: "marker-popup",
                    offset: new L.Point(-203, -368)
                };
                this.popup = L.popup(options);
                this.popup.setContent($("#tweet-popup")[0]);
            }
            else {
                this.popup.setContent($("#tweet-popup")[0]);
                this.popup.update();
            }
            this.popup.setLatLng(this.levent.latlng);
            this.map.openPopup(this.popup);
        };
        DashboardMapController.prototype.changeMapType = function (element) {
            this.mapSelected = element.target.id;
            this._selectedMap.onNext(this.mapSelected);
            if ((this.mapSelected === "thematic" || this.mapSelected === "intensity")
                && this.baseLayerSelected === "day") {
                this.switchBaseLayer();
            }
            if (this.mapSelected === "point" && this.baseLayerSelected === "night") {
                this.switchBaseLayer();
            }
            this.updateLayer();
        };
        DashboardMapController.prototype.updateLayer = function () {
            this.layerGroup.clearLayers();
            var layers = this.createLayers();
            for (var i in layers) {
                this.layerGroup.addLayer(layers[i]);
            }
        };
        DashboardMapController.prototype.createClusterLayer = function (url) {
            var options = {
                subdomains: gogeo.Configuration.subdomains,
                useJsonP: false
            };
            return new L.TileCluster(url, options);
        };
        DashboardMapController.$inject = [
            "$scope",
            "$cookies",
            "$timeout",
            "$location",
            "linkify",
            "$sce",
            "$geolocation",
            gogeo.DashboardService.$named,
            gogeo.MetricsService.$named
        ];
        return DashboardMapController;
    })();
    gogeo.registerDirective("dashboardMap", [
        "$timeout",
        function ($timeout) {
            return {
                restrict: "C",
                templateUrl: "dashboard/controls/dashboard-map-template.html",
                controller: DashboardMapController,
                controllerAs: "map",
                bindToController: true,
                link: function (scope, element, attrs, controller) {
                    var options = {
                        attributionControl: false,
                        minZoom: 4,
                        maxZoom: 18,
                        center: new L.LatLng(37.757836, -122.447041),
                        zoom: 6,
                        maptiks_id: "leaflet-map"
                    };
                    var mapContainerElement = element.find(".dashboard-map-container")[0];
                    var map = L.map("map-container", options);
                    controller.initialize(map);
                    $timeout(function () { return map.invalidateSize(false); }, 1);
                    scope.$on("$destroy", function () {
                        map.remove();
                    });
                }
            };
        }
    ]);
    gogeo.registerDirective("errSrc", function () {
        return {
            link: function (scope, element, attrs) {
                element.bind("error", function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set("src", attrs.errSrc);
                    }
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    gogeo.registerDirective("dashboardPanel", function () {
        return {
            restrict: "C",
            link: function (scope, element, attributes) {
                function adjustSizes() {
                    var body = $(document.body);
                    var size = {
                        width: body.innerWidth(),
                        height: body.innerHeight()
                    };
                    var $top = element.find(".dashboard-top-panel");
                    var $center = element.find(".dashboard-center-panel");
                    $top.height($top.attr("data-height") + "px");
                    $center.height(size.height - $top.height());
                }
                $(window).on("resize", adjustSizes);
                adjustSizes(); // forcing the first resize
                scope.$on("destroy", function () {
                    $(window).off("resize", adjustSizes);
                });
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    var DateHistogramChartController = (function () {
        function DateHistogramChartController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.SIMPLE_DATE_PATTERN = "YYYY-MM-dd";
            // buckets: Array<IDateHistogram> = [];
            this.buckets = [];
            this.options = {
                chart: {
                    type: 'multiChart',
                    height: 330,
                    width: 400,
                    color: [
                        "#1f77b4",
                        "#2ca02c"
                    ],
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 100
                    },
                    showValues: true,
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: "Tempo",
                        tickFormat: function (d) {
                            return moment(new Date(d)).format("DD/MM/YYYY");
                        },
                        showMaxMin: true,
                        rotateLabels: 50,
                        axisLabelDistance: 10
                    },
                    yAxis1: {
                        axisLabel: "Quantidade (k)",
                        tickFormat: function (d) {
                            return (d / 1000).toFixed(2);
                        },
                        axisLabelDistance: 30
                    },
                    yAxis2: {
                        axisLabel: "Valor (k)",
                        tickFormat: function (d) {
                            return (d / 1000).toFixed(2);
                        },
                        axisLabelDistance: 30,
                        width: 90,
                        margin: {
                            right: 70
                        }
                    }
                },
                title: {
                    enable: true,
                    text: "TRANSAÇÕES/PERÍODO",
                    class: "h4",
                    css: {
                        // width: "500px",
                        // padding: "500px",
                        textAlign: "left",
                        position: "relative",
                        top: "20px"
                    }
                }
            };
            this.service.queryObservable
                .where(function (q) { return q != null; })
                .throttle(400)
                .subscribeAndApply(this.$scope, function (query) { return _this.getDataChart(); });
            this.buckets = [
                {
                    key: "Quantidade",
                    type: "line",
                    yAxis: 1,
                    values: []
                },
                {
                    key: "R$",
                    type: "line",
                    yAxis: 2,
                    values: []
                }
            ];
        }
        DateHistogramChartController.prototype.getDataChart = function () {
            var _this = this;
            this.service.getDateHistogramAggregation().success(function (result) {
                var quantityValues = [];
                var amountValues = [];
                _this.buckets[0]["values"] = [];
                _this.buckets[1]["values"] = [];
                result.forEach(function (item) {
                    quantityValues.push({
                        x: item['timestamp'] + (3 * 3600 * 1000),
                        y: item['count']
                    });
                    amountValues.push({
                        x: item['timestamp'] + (3 * 3600 * 1000),
                        y: item['sum']
                    });
                });
                _this.buckets[0]["values"] = quantityValues;
                _this.buckets[1]["values"] = amountValues;
            });
        };
        DateHistogramChartController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return DateHistogramChartController;
    })();
    gogeo.DateHistogramChartController = DateHistogramChartController;
    gogeo.registerDirective("dateHistogramChart", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/date-histogram-chart-template.html",
            controller: DateHistogramChartController,
            controllerAs: "datehisto",
            bindToController: true,
            scope: {
                buckets: "="
            },
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    var SummaryController = (function () {
        function SummaryController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.morning = 0;
            this.afternoon = 0;
            this.night = 0;
            this.service.queryObservable
                .where(function (q) { return q != null; })
                .throttle(400)
                .subscribeAndApply(this.$scope, function (query) { return _this.getSummary(); });
        }
        SummaryController.prototype.getSummary = function () {
            var _this = this;
            this.service.getStatsAggregationSummary().success(function (result) {
                // var colors = [ "#053061", "#2166AC", "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
                result.forEach(function (item) {
                    if (item["key"] == "tarde") {
                        _this.afternoon = item["sum"];
                    }
                    if (item["key"] == "noite") {
                        _this.night = item["sum"];
                    }
                    else {
                        _this.morning = item["sum"];
                    }
                });
            });
        };
        SummaryController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return SummaryController;
    })();
    gogeo.SummaryController = SummaryController;
    gogeo.registerDirective("summary", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/summary-template.html",
            controller: SummaryController,
            controllerAs: "summary",
            bindToController: true,
            scope: {
                buckets: "="
            },
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
var gogeo;
(function (gogeo) {
    var TransactionsChartController = (function () {
        function TransactionsChartController($scope, $timeout, service) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.service = service;
            this.buckets = [];
            this.typeEstabBuckets = [];
            this.options = {};
            this.typeEstabOptions = {};
            angular.element(document).ready(function () {
                _this.getDataChart();
            });
            this.service.queryObservable
                .where(function (q) { return q != null; })
                .throttle(400)
                .subscribeAndApply(this.$scope, function (query) { return _this.getDataChart(); });
        }
        TransactionsChartController.prototype.getDataChart = function () {
            var _this = this;
            this.configureChartOptions();
            this.service.getStatsAggregationTypePay().success(function (result) {
                _this.buckets = [];
                // var colors = [ "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
                result.forEach(function (item) {
                    // console.log("********", item);
                    _this.buckets.push({
                        x: item['key'].toUpperCase(),
                        y: item['sum']
                    });
                });
            });
            this.service.getStatsAggregationTypeEstab().success(function (result) {
                _this.typeEstabBuckets = [];
                // var colors = [ "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
                result.forEach(function (item) {
                    // console.log("********", item);
                    _this.typeEstabBuckets.push({
                        x: item['key'],
                        y: item['sum']
                    });
                });
            });
        };
        TransactionsChartController.prototype.configureChartOptions = function () {
            var self = this;
            // this.options = {
            //   thickness: 200
            // };
            this.options = {
                chart: {
                    type: 'pieChart',
                    donut: true,
                    height: 230,
                    width: 460,
                    // x: function(d){return d.key;},
                    // y: function(d){return d.value;},
                    showLabels: false,
                    transitionDuration: 500,
                    labelThreshold: 0.01,
                    showLegend: false,
                    color: function (d, i) {
                        var colors = ["#FF7F0E", "#4393C3", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D"];
                        return colors[i % colors.length];
                    }
                },
                title: {
                    enable: true,
                    text: "SHARE DE TIPOS DE PAGAMENTOS",
                    class: "h4",
                    css: {
                        // width: "500px",
                        // padding: "500px",
                        textAlign: "left",
                        position: "relative",
                        top: "20px"
                    }
                }
            };
            this.typeEstabOptions = Object.create(this.options);
            this.typeEstabOptions["chart"]["x"] = function (d) {
                return self.getReducedName(d.x);
            };
            this.typeEstabOptions["title"]["text"] = "SHARE DE TIPOS DE ESTABELECIMENTOS";
        };
        TransactionsChartController.prototype.getReducedName = function (key) {
            var reducedNames = {
                "Restaurantes e outros serviços de alimentação e bebidas": "restaurantes",
                "Comércio varejista de equipamentos de informática e comunicação; equipamentos e artigos de uso doméstico": "informatica",
                "Comércio varejista de produtos alimentícios, bebidas e fumo": "alimentos",
                "Comércio varejista de material de construção": "construcao",
                "Comércio varejista de produtos farmacêuticos, perfumaria e cosméticos e artigos médicos, ópticos e ortopédicos": "farmaceutico",
                "Comércio varejista de combustíveis para veículos automotores": "combustiveis",
                "Hotéis e similares": "hoteis"
            };
            return reducedNames[key];
        };
        TransactionsChartController.$inject = [
            "$scope",
            "$timeout",
            gogeo.DashboardService.$named
        ];
        return TransactionsChartController;
    })();
    gogeo.TransactionsChartController = TransactionsChartController;
    gogeo.registerDirective("transactionsChart", function () {
        return {
            restrict: "E",
            templateUrl: "dashboard/controls/transactions-chart-template.html",
            controller: TransactionsChartController,
            controllerAs: "transactions",
            bindToController: true,
            scope: {
                buckets: "="
            },
            link: function (scope, element, attrs, controller) {
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />
/**
 * Created by danfma on 06/03/15.
 */
var gogeo;
(function (gogeo) {
    var DataRangeController = (function () {
        function DataRangeController($scope, service) {
            this.$scope = $scope;
            this.service = service;
            this.min = null;
            this.max = null;
        }
        DataRangeController.prototype.initialize = function () {
            var _this = this;
            this.service.dateLimitObservable
                .subscribeAndApply(this.$scope, function (result) {
                if (result) {
                    _this.min = moment(new Date(result["min"])).format("MM/DD/YYYY");
                    _this.max = moment(new Date(result["max"])).format("MM/DD/YYYY");
                }
            });
        };
        DataRangeController.$inject = [
            "$scope",
            gogeo.DashboardService.$named
        ];
        return DataRangeController;
    })();
    gogeo.registerDirective("daterange", function () {
        return {
            restrict: "E",
            template: "\n                <div class=\"input-group daterange\">\n                    <input \n                        id=\"startRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"startDate\"/>\n                    <span class=\"input-group-addon\">\n                        <i class=\"glyphicon glyphicon-calendar\"></i>\n                    </span>\n                    <input\n                        id=\"endRange\"\n                        class=\"form-control\"\n                        type=\"text\"\n                        data-provide=\"datepicker\"\n                        data-date-clear-btn=\"true\"\n                        data-date-start-date=\"{{range.min}}\"\n                        data-date-end-date=\"{{range.max}}\"\n                        data-date-autoclose=\"true\"\n                        ng-model=\"endDate\"/>\n                </div>",
            scope: {
                startDate: "=",
                endDate: "="
            },
            controller: DataRangeController,
            controllerAs: "range",
            link: function (scope, element, attrs, controller) {
                controller.initialize();
            }
        };
    });
})(gogeo || (gogeo = {}));
/// <reference path="../../shell.ts" />
/**
 * Created by danfma on 05/03/15.
 */
var gogeo;
(function (gogeo) {
    angular.module("gogeo")
        .directive("welcomeMap", [
        function () {
            return {
                restrict: "C",
                // template: "<div></div>",
                link: function (scope, element, attrs) {
                    var rawElement = element[0];
                    var url = "http://api.gogeo.io/1.0/map/" + gogeo.Configuration.getDatabaseName() + "/tweets/{z}/{x}/{y}/tile.png?mapkey=123&stylename=gogeo_many_points";
                    var initialPos = L.latLng(43.717232, -92.353034);
                    var map = L.map("welcome-map").setView(initialPos, 5);
                    map.addLayer(L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
                        attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
                    }));
                    L.tileLayer(url).addTo(map);
                    scope.$on("destroy", function () { return map.remove(); });
                }
            };
        }
    ]);
})(gogeo || (gogeo = {}));
