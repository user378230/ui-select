uis.directive('uiSelectHeader', function(){
  return {
    template: '<li class="ui-select-header" ng-transclude></li>',
    restrict: 'EA',
    transclude: true,
    replace: true
  };
});