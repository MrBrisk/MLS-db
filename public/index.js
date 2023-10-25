let selectedTab = 'Teams';
let outputTable;
const loader = $('#loading');
const tableContainer = $('#tableContainer');
const addBtn = $('#addBtn');
const deleteBtn = $('#deleteBtn');

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
      addBtn.html('Add Team');
      addBtn.attr('hidden', false);
      deleteBtn.html('Delete Team');
      deleteBtn.attr('hidden', true);
      $('.query-btn').attr('hidden', true);
      getTeams();
      break;
    case "Players":
      addBtn.html('Add Player');
      addBtn.attr('hidden', false);
      deleteBtn.html('Delete Player');
      deleteBtn.attr('hidden', true);
      $('.query-btn').attr('hidden', true);
      getPlayers();
      break;
    case "Games":
      addBtn.html('Add Game');
      addBtn.attr('hidden', false);
      deleteBtn.html('Delete Game');
      deleteBtn.attr('hidden', true);
      $('.query-btn').attr('hidden', true);
      getGames();
      break;
    case "Advanced Queries":
      addBtn.attr('hidden', true);
      deleteBtn.attr('hidden', true);
      $('.query-btn').attr('hidden', false);
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
    scrollY: '53vh',
    deferRender: true,
    scroller: true
  });
  loader.attr('hidden', true);
}
