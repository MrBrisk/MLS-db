let selectedTab = 'Teams';
let outputTable;
const loader = $('#loading');
const tableContainer = $('#tableContainer');

$(function () {
  tableContainer.attr('hidden', true);
  getTeams();
});

$('#outputSelectItems ul li').on('click', function(event) {
  if (event.target.id == 'currentTab')
    return;
  const oldSelection = $("#currentTab")[0];
  oldSelection.id = '';
  event.target.id = "currentTab";
  tableContainer.attr("hidden", true);
  loader.attr('hidden', false);
  outputTable.destroy();
  $('#outputTable tbody').empty();
  $('#outputTable thead').empty();
  changeTab(event.target.innerHTML);
});

function changeTab(tab) {
  selectedTab = tab;
  switch (tab) {
    case "Teams":
      getTeams();
      break;
    case "Players":
      getPlayers();
      break;
    case "Games":
      getGames();
      break;
    case "Advanced Queries":
      const data = [{'id': ''}]
      createDataTable(data);
      break;
    default:
      break;
  }
}

function getPlayers() {
  $.ajax({
    url: "/getPlayers",
    type: "GET",
    dataType: "json",
    success: (response) => {
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    }
  });
}

function getGames() {
  $.ajax({
    url: "/getGames",
    type: "GET",
    dataType: "json",
    success: (response) => {
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    }
  });
}

function getTeams() {
  $.ajax({
    url: "/getTeams",
    type: "GET",
    dataType: "json",
    success: (response) => {
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    }
  });
}

function createDataTable(data) {
  let columns = [];
  let columnNames = Object.keys(data[0]);
  for (let i in columnNames) {
    columns.push({
      data: columnNames[i],
      title: columnNames[i]
    });
  }
  tableContainer.attr("hidden", false);
  outputTable = new DataTable("#outputTable", {
    columns: columns,
    data: data,
    bAutoWidth: false,
    scrollX: true,
    scrollY: 300,
    deferRender: true,
    scroller: true
  });
  loader.attr('hidden', true);
}
