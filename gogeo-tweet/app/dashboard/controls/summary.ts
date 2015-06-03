/// <reference path="../../shell.ts" />

module gogeo {
  export class SummaryController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    credit: number = 0;
    debit: number = 0;
    morning: number = 0;
    afternoon: number = 0;
    night: number = 0;

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.getSummary());
    }

    getSummary() {
      this.service.getStatsAggregationSummary().success((result:Array<IStatsSumAgg>) => {
        // var colors = [ "#053061", "#2166AC", "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
        result.forEach((item) => {
          if(item["key"] == "crédito") {
            this.credit = item["sum"];
          } else {
            this.debit = item["sum"];
          }
        })
      });
    }
  }


  registerDirective("summary", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/summary-template.html",
      controller: SummaryController,
      controllerAs: "summary",
      bindToController: true,

      scope: {
        buckets: "="
      },

      link(scope, element, attrs, controller: SummaryController) {

      }
    };
  });
}