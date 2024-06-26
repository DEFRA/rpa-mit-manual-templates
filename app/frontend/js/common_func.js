$(function() {
  $('.backButton').on('click', function() {
    window.history.back();
 });
 $('#invoiceForm').on('submit', function(event) {
  event.preventDefault();
  let allGroupsSelected = true;
  let ard = [];

  $('input[type="radio"]').each(function() {
    const radioGroup = $(this).attr('name');
    ard.push(radioGroup)
    if ($(`input[name="${radioGroup}"]:checked`).length === 0) {
      allGroupsSelected = false;
      return false; 
    }
  });
  ard = [...new Set(ard)];
  if (!allGroupsSelected || ard.length != 5) {
    const messageElement = $('#error-message');
    messageElement.show();
    setTimeout(function() {
      messageElement.hide(); 
    }, 3000);
  } else {
    $('#error-message').hide(); 
    this.submit(); 
  }
});


$('#paymentForm').on('submit', function(event) {
  event.preventDefault();
  let allGroupsSelected = true;
  const inputs = document.querySelectorAll('.payment_inputs');
  for (const input of inputs) {
      console.log(input.value)
      if (input.value.trim() === '') {
        allGroupsSelected = false; 
      }
  }
  if (!allGroupsSelected) {
    const messageElement = $('#error-message');
    messageElement.show();
    setTimeout(function() {
      messageElement.hide(); 
    }, 3000);
  } else {
    $('#error-message').hide(); 
    this.submit(); 
  }
});


$('#lineForm').on('submit', function(event) {
  event.preventDefault();
  let allGroupsSelected = true;
  const inputs = document.querySelectorAll('.line_inputs');
  for (const input of inputs) {
      console.log(input.value)
      if (input.value.trim() === '') {
        allGroupsSelected = false; 
      }
  }
  if (!allGroupsSelected) {
    const messageElement = $('#error-message');
    messageElement.show();
    setTimeout(function() {
      messageElement.hide(); 
    }, 3000);
  } else {
    $('#error-message').hide(); 
    this.submit(); 
  }
});

const messageElement = $('.success_message');
if(messageElement)
{
setTimeout(function() {
  messageElement.hide(); 
}, 3000);
}

function groupByKeys(data, key) {
  return data.reduce((acc, item) => {
      const keyValue = item[key];
      if (!acc[keyValue]) {
          acc[keyValue] = [];
      }
      acc[keyValue].push(item);
      return acc;
  }, {});
}


const deliveryBodyOptions = pageTitle == 'Template Type'? groupByKeys(delivery_body_data, 'accountCode') : [];

const invoiceTemplateBodyOptions = pageTitle == 'Template Type'? groupByKeys(invoice_template, 'deliveryBodyCode') : [];

const deliveryBodyOptionsUnique = pageTitle == 'Template Type'? groupByKeys(delivery_body_data, 'code') : [];

const invoiceTemplateSecondaryBodyOptions = pageTitle == 'Template Type'? invoice_template_secondary_data : [];

function updateBodyOptions(selectedType , container_name , radio_name, heading) {
  const bodyContainer = document.getElementById(container_name);
  let options = [];
  
  if(radio_name == 'invoice_template_secondary')
  {
    options =  deliveryBodyOptionsUnique[selectedType]?invoiceTemplateSecondaryBodyOptions:[];
  }
  else if(radio_name == 'invoice_template')
  {
    options =  invoiceTemplateBodyOptions[selectedType] || []
  }
  else
  {
    options =  deliveryBodyOptions[selectedType] || []
    updateBodyOptions("", 'invoice-template-body-container', 'invoice_template', 'Select Scheme Invoice Template');
    updateBodyOptions("", 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question');
  }

  let html = '';
  options.forEach(option => {
    html += `
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${radio_name}_${option.code?option.code:option.id}" name="${radio_name}" type="radio" value="${option.code?option.code:option.id}">
        <label class="govuk-label govuk-radios__label" for="${radio_name}_${option.code?option.code:option.id}">
          ${option.name?option.name:option.deliveryBodyDescription}
        </label>
      </div>
    `;

    if(radio_name == 'delivery_body')
    {
      setTimeout(()=>{
        const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_body"]');   
        deliveryTypeRadios.forEach(radio => {
          radio.addEventListener('change', function () {
            updateBodyOptions(this.value, 'invoice-template-body-container', 'invoice_template', 'Select Scheme Invoice Template');
            updateBodyOptions(this.value, 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question');
          });
        });
      },50)
    }
  });

  bodyContainer.innerHTML = `
    <fieldset class="govuk-fieldset">
      <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">${heading}</legend>
      <div class="govuk-radios govuk-radios--inline radio-border">
        ${html}
      </div>
    </fieldset>
  `;
    
}
if(pageTitle == 'Template Type')
{
const accountTypeRadios = document.querySelectorAll('input[name="account_type"]');
accountTypeRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    updateBodyOptions(this.value, 'delivery-body-container', 'delivery_body', 'Select Delivery Body');
  });
});
}
});
