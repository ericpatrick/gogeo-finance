/// <reference path="../../shell.ts" />

module gogeo {
  export class TransactionsChartController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    buckets: Array<any> = [];
    options: any = {};

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      angular.element(document).ready(() => {
        this.getDataChart();
        
      });

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.getDataChart());
    }

    getDataChart() {

      this.buckets = [
        // {label: "one", value: 12.2, color: "red"}, 
        // {label: "two", value: 45, color: "#00ff00"},
        // {label: "three", value: 10, color: "rgb(0, 0, 255)"} 

        // {key: "one", y: 12.2}, 
        // {key: "two", y: 45},
        // {key: "three", y: 10}
      ];

      this.configureChartOptions();

      this.service.getStatsAggregationSummary().success((result:Array<IStatsSumAgg>) => {
        // var colors = [ "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
        result.forEach((item) => {
          // console.log("********", item);
          this.buckets.push(
            {
              x: item['key'].toUpperCase(),
              y: item['sum']
            }
          );
        })
      });
    }

    configureChartOptions() {
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
            var colors = [ "#FF7F0E", "#4393C3" ];
            return colors[i % colors.length];
          }
          // tooltipContent: function (key, y, e, graph) {
          //   return '<h4 style="background-color: #F0F0F0; padding: 5px 0px 5px 10px; margin-top: 0px"><strong>' + key + '</strong></h4>' +
          //          '<div style="width: 140px"><center>R$' +  y + '</center></div>'
          // }
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
    }
  }

  registerDirective("transactionsChart", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/transactions-chart-template.html",
      controller: TransactionsChartController,
      controllerAs: "transactions",
      bindToController: true,

      scope: {
        buckets: "="
      },

      link(scope, element, attrs, controller: TransactionsChartController) {

      }
    };
  });
}