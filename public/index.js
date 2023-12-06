let selectedTab = 'Team';
let outputTable;
const loader = $('#loading');
const tableElement = $('#outputTable');
const addBtn = $('#addBtn');
const editBtn = $('#editBtn');
let selectedRow;
let requiredColumnsByTable = {};

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
  tableElement.attr('hidden', true);
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
      if (col.includes('date_played')) {
        type = 'datetime-local';
      } else if (col.includes('date')) {
        type = 'date';
      } else if (col.includes('color')) {
        type = 'color';
      }
      let asterisk = ' ';
      if (requiredColumnsByTable[`${selectedTab}`].includes(`${col}`)) {
        asterisk = `<span style='color: red'>* </span>`;
      }
      modalContent +=
        `<div class='modalInputItem' id='input${i}'>` +
        `<label for='${col}'>${col}${asterisk}</label>` +
        `<input id='${col}' name='${col}' type='${type}' class='modalInput'><br></br>` +
        '</div>\n';
    }
    i++;
  }

  modalContent += "</form>\n</div>";
  modal.setContent(modalContent);
  modal.setFooterContent('');

  addModalAddButton();

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
      if (key.includes('date_played')) {
        type = 'datetime-local';
        value = value.split('.')[0];
      } else if (key.includes('date')) {
        type = 'date';
        value = value.split('T')[0];
      } else if (key.includes('color')) {
        type = 'color';
      }
      let asterisk = ' ';
      if (requiredColumnsByTable[`${selectedTab}`].includes(`${key}`)) {
        asterisk = `<span style='color: red'>* </span>`;
      }
      modalContent +=
        `<div class='modalInputItem' id='input${i}'>` +
          `<label for='${key}'>${key}${asterisk}</label>` +
          `<input id='${key}' name='${key}' type='${type}' class='modalInput' value='${value}'><br></br>` +
        '</div>\n';
    }
    i++;
  }
  modalContent += "</form>\n</div>";
  modal.setContent(modalContent);
  modal.setFooterContent('');

  addModalEditButton();

  addModalDeleteButton();

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

$(document).on('change', '.required-input', function (event) {
  $(event.target).removeClass('required-input');
});

$('.query-btn').on('click', function (event) {
  if (event.target.id == 'currentQuery') return;
  const oldButton = $('#currentQuery')[0];
  if (oldButton != null) {
    oldButton.id = '';
    $('.currentGroup p').attr('hidden', true);
    $('.currentGroup div').attr('hidden', true);
    $('.currentGroup')[0].classList.remove('currentGroup');
  }
  event.target.id = 'currentQuery';
  event.target.parentElement.classList.add('currentGroup');
  $('.currentGroup p').attr('hidden', false);
  $('.currentGroup div').attr('hidden', false);

  const currentOption = $('.currentGroup')[0].id == 'advQuery3' ? $('#currentRangeValue')[0] : $('.currentGroup div button.currentOption')[0];
  executeAdvancedQuery({
    queryId: $('.currentGroup')[0].id,
    value: currentOption == null ? '' : currentOption.innerText
  });
});

$('.query-options-btn').on('click', function (event) {
  if (event.target.classList.contains('currentOption')) return;
  let value;
  if (event.target.classList.contains('range-submit')) {
    value = $('#currentRangeValue')[0].innerText;
  } else {
    const oldButton = $('.currentGroup div button.currentOption')[0];
    oldButton.classList.remove('currentOption');
    event.target.classList.add('currentOption');
    value = $('.currentGroup div button.currentOption')[0].innerText;
  }

  executeAdvancedQuery({
    queryId: $('.currentGroup')[0].id,
    value: value
  });
});

function changeTab(tab) {
  selectedTab = tab;
  tableElement.attr('hidden', true);
  loader.attr('hidden', false);
  outputTable.destroy();
  $('#outputTable tbody').empty();
  $('#outputTable thead').empty();
  addBtn.html(`Add ${selectedTab}`);
  editBtn.html(`Edit ${selectedTab}`);
  addBtn.attr('hidden', false);
  editBtn.attr('hidden', true);
  $('.query-btn').attr('hidden', true);
  const oldButton = $('#currentQuery')[0];
  if (oldButton != null) {
    oldButton.id = '';
    $('.currentGroup p').attr('hidden', true);
    $('.currentGroup div').attr('hidden', true);
    $('.currentGroup')[0].classList.remove('currentGroup');
  }
  
  if (tab == 'Advanced Queries') {
    addBtn.attr('hidden', true);
    editBtn.attr('hidden', true);
    $('.query-btn').attr('hidden', false);
    createDataTable([{ id: '' }]);
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
      // get required fields
      if (requiredColumnsByTable[`${selectedTab}`] == null) {
        let required = [];
        for (let i in response[1]) {
          const info = response[1][i];
          if (info['flags'] % 2 != 0) {
            required.push(info['name']);
          }
        }
        requiredColumnsByTable[`${selectedTab}`] = required;
      }
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    },
  });
}

function createDataTable(data) {
  // no selecting table on advanced queries
  const selectOptions = selectedTab == 'Advanced Queries' ? false : {style: 'single'};
  let columns = [];
  if (data.length == 0) {
    data = [{ id: '' }];
  }
  let columnNames = Object.keys(data[0]);
  for (let i in columnNames) {
    columns.push({
      data: columnNames[i],
      title: columnNames[i],
    });
  }
  tableElement.attr('hidden', false);
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
  let asterisk = ' ';
  if (requiredColumnsByTable[`${selectedTab}`].includes(`${key}`)) {
    asterisk = `<span style='color: red'>* </span>`;
  }
  let select =
    `<div class='modalInputItem' id='input${i}'>\n` +
      `<label for='${key}'>${key}${asterisk}</label>\n` +
      `<select class='modalInput' name='${key}' id='${key}'>\n` +
        `<option disabled selected class='dummyOption'></option>`;
  for (const i in res[0]) {
    const id = Object.values(res[0][i])[0];
    const selected = value == id ? 'selected' : '';
    select += `<option ${selected} value='${id}'>${id}</option>\n`;
  }
  select += '</select><br></br>' + '</div>\n';
  return select;
}

function addModalAddButton() {
  modal.addFooterBtn(
    `Add ${selectedTab}`,
    'tingle-btn tingle-btn--primary tingle-btn--pull-right submit',
    function () {
      $('button.submit').attr('disabled', 'true');
      $('button.submit')
        .removeClass('tingle-btn--primary')
        .addClass('tingle-btn--primary-clicked');
      let data = {};
      let missingRequired = false;
      $('.dummyOption').removeAttr('disabled');

      $.each($('#modalForm').serializeArray(), function (_, kv) {
        data[kv.name] = kv.value;
        if (requiredColumnsByTable[`${selectedTab}`].includes(kv.name)) {
          if (kv.value == '' || kv.value == null || kv.value == undefined) {
            $(`#${kv.name}`).addClass('required-input');
            missingRequired = true;
          }
        }
      });

      $('.dummyOption').attr('disabled', 'true');
      if (missingRequired) {
        $('button.submit').removeAttr('disabled');
        $('button.submit')
          .addClass('tingle-btn--primary')
          .removeClass('tingle-btn--primary-clicked');
        return;
      }

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
    }
  );
}

function addModalEditButton() {
  modal.addFooterBtn(
    `Update ${selectedTab}`,
    'tingle-btn tingle-btn--primary tingle-btn--pull-right',
    function () {
      $('button.submit').attr('disabled', 'true');
      $('button.submit')
        .removeClass('tingle-btn--primary')
        .addClass('tingle-btn--primary-clicked');
      let data = {};
      let missingRequired = false;

      $.each($('#modalForm').serializeArray(), function (_, kv) {
        data[kv.name] = kv.value;
        if (requiredColumnsByTable[`${selectedTab}`].includes(kv.name)) {
          if (kv.value == '' || kv.value == null || kv.value == undefined) {
            $(`#${kv.name}`).addClass('required-input');
            missingRequired = true;
          }
        }
      });

      if (missingRequired) {
        $('button.submit').removeAttr('disabled');
        $('button.submit')
          .addClass('tingle-btn--primary')
          .removeClass('tingle-btn--primary-clicked');
        return;
      }

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
    }
  );
}

function addModalDeleteButton() {
  modal.addFooterBtn(
    `Delete ${selectedTab}`,
    'tingle-btn tingle-btn--danger',
    function () {
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
    }
  );
}

function executeAdvancedQuery(data) {
  tableElement.attr('hidden', true);
  loader.attr('hidden', false);
  outputTable.destroy();
  $('#outputTable tbody').empty();
  $('#outputTable thead').empty();
  $.ajax({
    url: `/${data['queryId']}`,
    type: 'POST',
    data: {
      value: data['value']
    },
    dataType: 'json',
    success: (response) => {
      createDataTable(response[0]);
    },
    failure: (response) => {
      console.log(response);
    }
  });
}
