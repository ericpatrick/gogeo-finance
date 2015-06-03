/// <reference path="../../shell.ts" />

module gogeo {
  export class DateHistogramChartController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    SIMPLE_DATE_PATTERN: string = "YYYY-MM-dd";
    // buckets: Array<IDateHistogram> = [];
    buckets: any = [];
    options: any = {
      chart: {
        type: 'multiChart',
        height: 330,
        width: 400,
        color: [
          "#1f77b4",
          "#2ca02c"
        ],
        margin : {
          top: 20,
          right: 20,
          bottom: 40,
          left: 100
        },
        showValues: true,
        transitionDuration: 500,
        xAxis: {
          axisLabel: "Tempo",
          tickFormat: function(d) {
            return moment(new Date(d)).format("DD/MM/YYYY");
          },
          showMaxMin: true,
          rotateLabels: 50,
          axisLabelDistance: 10
        },
        yAxis1: {
          axisLabel: "Quantidade (k)",
          tickFormat: function(d) {
            return (d / 1000).toFixed(2);
          },
          axisLabelDistance: 30
        },
        yAxis2: {
          axisLabel: "Valor (k)",
          tickFormat: function(d) {
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

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.getDataChart());

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

    getDataChart() {
      this.service.getDateHistogramAggregation().success((result: Array<IDateHistogram>) => {
        var quantityValues = [];
        var amountValues = [];
        this.buckets[0]["values"] = [];
        this.buckets[1]["values"] = [];
        result.forEach((item) => {
          quantityValues.push({
            x: item['timestamp'] + (3 * 3600 * 1000), // Add time offset +3 hours
            y: item['count']
          });
          amountValues.push({
            x: item['timestamp'] + (3 * 3600 * 1000), // Add time offset +3 hours
            y: item['sum']
          });
        });

        this.buckets[0]["values"] = quantityValues;
        this.buckets[1]["values"] = amountValues;
      });
    }
  }

  registerDirective("dateHistogramChart", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/date-histogram-chart-template.html",
      controller: DateHistogramChartController,
      controllerAs: "datehisto",
      bindToController: true,

      scope: {
        buckets: "="
      },

      link(scope, element, attrs, controller: DateHistogramChartController) {

      }
    };
  });
}