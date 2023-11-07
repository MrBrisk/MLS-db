let selectedTab = 'Team';
let outputTable;
const loader = $('#loading');
const tableContainer = $('#tableContainer');
const addBtn = $('#addBtn');
const editBtn = $('#editBtn');
let selectedRow;
let modal = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'escape'],
  closeLabel: 'Close',
  onOpen: function () {
    $('#modalX').on('click', () => {
      modal.close();
    });
  },
});

$(function () {
  tableContainer.attr('hidden', true);
  getEntity();
});

addBtn.on('click', async function () {
  let outputColumns = [];
  outputTable.columns().header().each(function (col) {
    outputColumns.push(col.innerText);
  });
  let modalContent =
    "<div style='display: flex'>" +
      `<h3 id='modalTitle'>Add ${selectedTab}</h3>` +
      "<span id='modalX'>&times</span>" +
    "</div>" +
    "<hr style='border-color: #242323; width: 98%'>" + 
    "<div class='modalInputs'>" +
      "<form id='modalForm'>";
  for (let i in outputColumns) {
    let col = outputColumns[i];
    if (i != 0 && col.includes('_id')) {
      modalContent += await getIdDropdown(col, '', i);
    } else {
      let type = 'text';
      if (col.includes('date')) {
        type = 'date';
      } else if (col.includes('color')) {
        type = 'color';
      }
      modalContent +=
        `<div class='modalInputItem' id='input${i}'>` +
        `<label for='${col}'>${col} </label>` +
        `<input id='${col}' name='${col}' type='${type}' class='modalInput'><br></br>` +
        '</div>\n';
    }
    i++;
  }
  modalContent += "</form>\n</div>";
  modal.setContent(modalContent);
  modal.setFooterContent('');
  modal.addFooterBtn(`Add ${selectedTab}`, 'tingle-btn tingle-btn--primary tingle-btn--pull-right submit', function () {
    $('button.submit').attr('disabled', 'true');
    $('button.submit').removeClass('tingle-btn--primary').addClass('tingle-btn--primary-clicked');
    let data = {};
    $.each($('#modalForm').serializeArray(), function (_, kv) {
      data[kv.name] = kv.value;
    });
    $.ajax({
      url: `/add${selectedTab}`,
      type: 'POST',
      data: data,
      success: () => {
        modal.close();
        changeTab(selectedTab);
      },
      failure: (response) => {
        console.log(response);
        modal.close();
      },
    });
  });
  const idInput = $('#input0 input');
  idInput.attr('disabled', 'true');
  modal.open();
});

editBtn.on('click', async function () {
  let modalContent =
    "<div style='display: flex'>" +
      `<h3 id='modalTitle'>Edit ${selectedTab}</h3>` +
      "<span id='modalX'>&times</span>" +
    "</div>" +
    "<hr style='border-color: #242323; width: 98%'>" + 
    "<div class='modalInputs'>" +
      "<form id='modalForm'>\n";
  let i = 0;
  for (let [key, value] of Object.entries(selectedRow)) {
    if (i != 0 && key.includes('_id')) {
      modalContent += await getIdDropdown(key, value, i);
    } else {
      let type = 'text';
      if (key.includes('date')) {
        type = 'date';
        value = value.split('T')[0];
      } else if (key.includes('color')) {
        type = 'color';
      }
      modalContent +=
        `<div class='modalInputItem' id='input${i}'>` +
          `<label for='${key}'>${key} </label>` +
          `<input id='${key}' name='${key}' type='${type}' class='modalInput' value='${value}'><br></br>` +
        '</div>\n';
    }
    i++;
  }
  modalContent += "</form>\n</div>";
  modal.setContent(modalContent);
  modal.setFooterContent('');
  modal.addFooterBtn(`Update ${selectedTab}`, 'tingle-btn tingle-btn--primary tingle-btn--pull-right', function () {
    $('button.submit').attr('disabled', 'true');
    $('button.submit')
      .removeClass('tingle-btn--primary')
      .addClass('tingle-btn--primary-clicked');
    let data = {};
    $.each($('#modalForm').serializeArray(), function (_, kv) {
      data[kv.name] = kv.value;
    });
    $.ajax({
      url: `/edit${selectedTab}`,
      type: 'POST',
      data: data,
      success: () => {
        modal.close();
        changeTab(selectedTab);
      },
      failure: (response) => {
        console.log(response);
        modal.close();
      },
    });
  });
  modal.addFooterBtn(`Delete ${selectedTab}`, 'tingle-btn tingle-btn--danger', function () {
    $('button.tingle-btn--danger').attr('disabled', 'true');
    $('button.tingle-btn--danger')
      .removeClass('tingle-btn--danger')
      .addClass('tingle-btn--danger-clicked');
    const idInput = $('#input0 input')[0];
    let data = {};
    data[idInput.id] = idInput.value;
    $.ajax({
      url: `/delete${selectedTab}`,
      type: 'POST',
      data: data,
      success: () => {
        modal.close();
        changeTab(selectedTab);
      },
      failure: (response) => {
        console.log(response);
        modal.close();
      },
    });
  });
  $('#input0').attr('disabled', 'true');
  modal.open();
});

$('#outputSelectItems ul li').on('click', function (event) {
  if (event.target.id == 'currentTab') return;
  const oldSelection = $('#currentTab')[0];
  oldSelection.id = '';
  event.target.id = 'currentTab';
  changeTab($(event.target).attr('data-value'));
});

function changeTab(tab) {
  selectedTab = tab;
  tableContainer.attr('hidden', true);
  loader.attr('hidden', false);
  outputTable.destroy();
  $('#outputTable tbody').empty();
  $('#outputTable thead').empty();
  addBtn.html(`Add ${selectedTab}`);
  editBtn.html(`Edit ${selectedTab}`);
  addBtn.attr('hidden', false);
  editBtn.attr('hidden', true);
  $('.query-btn').attr('hidden', true);
  
  if (tab == 'Advanced Queries') {
    addBtn.attr('hidden', true);
    editBtn.attr('hidden', true);
    $('.query-btn').attr('hidden', false);
    const data = [{ id: '' }];
    createDataTable(data);
  } else {
    getEntity();
  }
}

function getEntity() {
  $.ajax({
    url: `/get${selectedTab}s`,
    type: 'GET',
    dataType: 'json',
    success: (response) => {
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    },
  });
}

function createDataTable(data) {
  const selectOptions = selectedTab == 'Advanced Queries' ? false : {style: 'single'};
  let columns = [];
  let columnNames = Object.keys(data[0]);
  for (let i in columnNames) {
    columns.push({
      data: columnNames[i],
      title: columnNames[i],
    });
  }
  tableContainer.attr('hidden', false);
  outputTable = new DataTable('#outputTable', {
    columns: columns,
    data: data,
    bAutoWidth: false,
    scrollX: true,
    scrollY: '53vh',
    deferRender: true,
    scroller: true,
    select: selectOptions,
  });
  loader.attr('hidden', true);

  outputTable
    .on('select', function (e, dt, type, index) {
      selectedRow = outputTable.rows(index).data()[0];
      editBtn.attr('hidden', false);
    })
    .on('deselect', function () {
      editBtn.attr('hidden', true);
      selectedRow = null;
    });
}

async function getIdDropdown(key, value, i) {
  let type = null;
  if (key.includes('team_id')) {
    type = 'Team';
  } else if (key.includes('player_id')) {
    type = 'Player';
  } else if (key.includes('game_id')) {
    type = 'Game';
  }
  const res = await $.ajax({
    url: `/get${type}Ids`,
    type: 'GET',
    dataType: 'json',
  });
  let select =
    `<div class='modalInputItem' id='input${i}'>\n` +
    `<label for='${key}'>${key} </label>\n` +
    `<select class='modalInput'>\n`;
  for (const i in res[0]) {
    const id = Object.values(res[0][i])[0];
    const selected = value == id ? 'selected' : '';
    select += `<option ${selected} value='${id}'>${id}</option>\n`;
  }
  select += '</select><br></br>' + '</div>\n';
  return select;
}
