/// <reference path="../../shell.ts" />

module gogeo {
  export class TransactionsChartController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    buckets: Array<any> = [];
    typeEstabBuckets: Array<any> = [];
    options: any = {};
    typeEstabOptions: any = {};

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

      this.configureChartOptions();

      this.service.getStatsAggregationTypePay().success((result:Array<IStatsSumAgg>) => {
        this.buckets = [
          // {label: "one", value: 12.2, color: "red"}, 
          // {label: "two", value: 45, color: "#00ff00"},
          // {label: "three", value: 10, color: "rgb(0, 0, 255)"} 

          // {key: "one", y: 12.2}, 
          // {key: "two", y: 45},
          // {key: "three", y: 10}
        ];
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

      this.service.getStatsAggregationTypeEstab().success((result:Array<IStatsSumAgg>) => {
        this.typeEstabBuckets = [
          // {label: "one", value: 12.2, color: "red"}, 
          // {label: "two", value: 45, color: "#00ff00"},
          // {label: "three", value: 10, color: "rgb(0, 0, 255)"} 

          // {key: "one", y: 12.2}, 
          // {key: "two", y: 45},
          // {key: "three", y: 10}
        ];
        // var colors = [ "#4393C3", "#92C5DE", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F" ];
        result.forEach((item) => {
          // console.log("********", item);
          this.typeEstabBuckets.push(
            {
              x: item['key'],
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
            var colors = [ "#FF7F0E", "#4393C3", "#D1E5F0", "#FFFFBF", "#FDDBC7", "#F4A582", "#D6604D" ];
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

      this.typeEstabOptions = Object.create(this.options);

      this.typeEstabOptions["chart"]["x"] = function(d) {
          return self.getReducedName(d.x);
      };

      this.typeEstabOptions["title"]["text"] = "SHARE DE TIPOS DE ESTABELECIMENTOS";
    }

    getReducedName(key: string) {
      var reducedNames = {
        "Restaurantes e outros serviços de alimentação e bebidas": "restaurantes",
        "Comércio varejista de equipamentos de informática e comunicação; equipamentos e artigos de uso doméstico": "informatica",
        "Comércio varejista de produtos alimentícios, bebidas e fumo": "alimentos",
        "Comércio varejista de material de construção": "construcao",
        "Comércio varejista de produtos farmacêuticos, perfumaria e cosméticos e artigos médicos, ópticos e ortopédicos": "farmaceutico",
        "Comércio varejista de combustíveis para veículos automotores": "combustiveis",
        "Hotéis e similares": "hoteis"
      };

      return reducedNames[key]
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