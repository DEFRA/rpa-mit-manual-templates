/* global $, deliveryBodyData, invoiceTemplate, invoiceTemplateSecondaryData */

$(function () {
  $('.backButton').on('click', function () {
    window.history.back()
  })

  $('#invoiceForm').on('submit', function (event) {
    event.preventDefault()
    let allGroupsSelected = true
    let ard = []

    $('input[type="radio"]').each(function () {
      const radioGroup = $(this).attr('name')
      ard.push(radioGroup)
      if ($(`input[name="${radioGroup}"]:checked`).length === 0) {
        allGroupsSelected = false
        return false
      }
    })

    const inputs = document.querySelectorAll('.invoice_inputs')
    for (const input of inputs) {
      if (input.value.trim() === '') {
        allGroupsSelected = false
      }
    }

    ard = [...new Set(ard)]
    if (!allGroupsSelected || ard.length !== 5) {
      const messageElement = $('#error-message')
      messageElement.show()
      setTimeout(function () {
        messageElement.hide()
      }, 3000)
    } else {
      $('#error-message').hide()
      this.submit()
    }
  })

  $('#uploadBulk').on('submit', function (event) {
    event.preventDefault()
    let allGroupsSelected = true
    let ard = []

    $('input[type="radio"]').each(function () {
      const radioGroup = $(this).attr('name')
      ard.push(radioGroup)
      if ($(`input[name="${radioGroup}"]:checked`).length === 0) {
        allGroupsSelected = false
        return false
      }
    })

    if (!$('#bulk_file').val()) { allGroupsSelected = false }

    ard = [...new Set(ard)]
    if (!allGroupsSelected || ard.length !== 3) {
      const messageElement = $('#error-message')
      messageElement.show()
      setTimeout(function () {
        messageElement.hide()
      }, 3000)
    } else {
      $('#error-message').hide()
      this.submit()
    }
  })

  $('#paymentForm').on('submit', function (event) {
    event.preventDefault()
    let allGroupsSelected = true
    let messageset = ''
    const frn = $('#frn').val().trim()
    const sbi = $('#sbi').val().trim()
    const vendor = $('#vendor').val().trim()
    const filledFields = [frn, sbi, vendor].filter(field => field !== '').length

    if (filledFields !== 1) {
      allGroupsSelected = false
      messageset = 'Select only one of FRN, SBI, and Vendor.'
    } else if (frn !== '') {
      const frnRegex = /^[0-9]{10}$/
      if (!frnRegex.test(frn)) {
        allGroupsSelected = false
        messageset = 'The FRN must be a 10-digit number or be empty.'
      }
    } else if (sbi !== '') {
      const sbiRegex = /^(1050{5}|10[5-9]\d{6}|1[1-9]\d{7}|[2-9]\d{8})$/ // Custom SBI validation
      if (!sbiRegex.test(sbi)) {
        allGroupsSelected = false
        messageset = 'The SBI is not in valid range (105000000 .. 999999999) or should be empty.'
      }
    } else if (vendor !== '') {
      if (vendor.length < 3) {
        allGroupsSelected = false
        messageset = 'Vendor must be longer than 3 characters.'
      }
    } else {
      const inputs = document.querySelectorAll('.payment_inputs')
      for (const input of inputs) {
        if (input.value.trim() === '') {
          messageset = '<span>Error:  Fill All The Fields</span>'
          allGroupsSelected = false
        }
      }
    }

    if (!allGroupsSelected) {
      const messageElement = $('#error-message')
      messageElement.html(messageset)
      messageElement.show()
      setTimeout(function () {
        messageElement.hide()
      }, 3000)
    } else {
      $('#error-message').hide()
      this.submit()
    }
  })

  $('#lineForm').on('submit', function (event) {
    event.preventDefault()
    let allGroupsSelected = true
    const inputs = document.querySelectorAll('.line_inputs')
    for (const input of inputs) {
      if (input.value.trim() === '') {
        allGroupsSelected = false
      }
    }
    if (!allGroupsSelected) {
      const messageElement = $('#error-message')
      messageElement.show()
      setTimeout(function () {
        messageElement.hide()
      }, 3000)
    } else {
      $('#error-message').hide()
      this.submit()
    }
  })

  const messageElement = $('.success_message')
  if (messageElement) {
    setTimeout(function () {
      messageElement.hide()
    }, 3000)
  }

  const messageElementSecond = $('.error_message')
  if (messageElementSecond) {
    setTimeout(function () {
      messageElementSecond.hide()
    }, 3000)
  }

  function groupByKeys (data, key) {
    return data.reduce((acc, item) => {
      const keyValue = item[key]
      if (!acc[keyValue]) {
        acc[keyValue] = []
      }
      acc[keyValue].push(item)
      return acc
    }, {})
  }

  try {
    const deliveryBodyOptions = deliveryBodyData ? groupByKeys(deliveryBodyData, 'accountCode') : []
    const invoiceTemplateBodyOptions = invoiceTemplate ? groupByKeys(invoiceTemplate, 'deliveryBodyCode') : []
    const deliveryBodyOptionsUnique = deliveryBodyData ? groupByKeys(deliveryBodyData, 'code') : []
    const invoiceTemplateSecondaryBodyOptions = invoiceTemplateSecondaryData || []

    function updateBodyOptions (selectedType, containerName, radioName, heading) {
      const bodyContainer = document.getElementById(containerName)
      if (!bodyContainer) return
      let options = []

      if (radioName === 'invoice_template_secondary') {
        options = deliveryBodyOptionsUnique[selectedType] ? invoiceTemplateSecondaryBodyOptions : []
        updateBodyOptions('', 'invoice-template-body-container', 'invoiceTemplate', 'Select Scheme Invoice Template')
      } else if (radioName === 'invoiceTemplate') {
        options = invoiceTemplateBodyOptions[selectedType] || []
      } else {
        options = deliveryBodyOptions[selectedType] || []
        updateBodyOptions('', 'invoice-template-body-container', 'invoiceTemplate', 'Select Scheme Invoice Template')
        updateBodyOptions('', 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question')
      }

      let html = ''
      options.forEach(option => {
        html += `
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${radioName}_${option.code ? option.code : option.id}" name="${radioName}" type="radio" value="${option.code ? option.code : option.name}">
        <label class="govuk-label govuk-radios__label" for="${radioName}_${option.code ? option.code : option.name}">
          ${option.name ? option.name : option.deliveryBodyDescription}
        </label>
      </div>
    `

        if (radioName === 'deliveryBody') {
          setTimeout(() => {
            const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryBody"]')
            deliveryTypeRadios.forEach(radio => {
              radio.addEventListener('change', function () {
                if (invoiceTemplateSecondaryData) {
                  updateBodyOptions(this.value, 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question')
                } else {
                  updateBodyOptions(this.value, 'invoice-template-body-container', 'invoiceTemplate', 'Select Scheme Invoice Template')
                }
              })
            })
          }, 50)
        }

        if (radioName === 'invoice_template_secondary') {
          setTimeout(() => {
            const secondaryTypeRadios = document.querySelectorAll('input[name="invoice_template_secondary"]')
            secondaryTypeRadios.forEach(radio => {
              radio.addEventListener('change', function () {
                updateBodyOptions(document.querySelector('input[name="deliveryBody"]:checked').value, 'invoice-template-body-container', 'invoiceTemplate', 'Select Scheme Invoice Template')
              })
            })
          }, 50)
        }
      })

      bodyContainer.innerHTML = `
    <fieldset class="govuk-fieldset">
      <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">${heading}</legend>
      <div class="govuk-radios govuk-radios--inline radio-border">
        ${html}
      </div>
    </fieldset>
  `
    }

    const accountTypeRadios = document.querySelectorAll('input[name="accountType"]')
    accountTypeRadios.forEach(radio => {
      radio.addEventListener('change', function () {
        updateBodyOptions(this.value, 'delivery-body-container', 'deliveryBody', 'Select Delivery Body')
      })
    })
  } catch (e) {
  }

  $('#showPopup').on('click', function () {
    $('#reason').val('')
    $('#popupOverlay').fadeIn()
  })

  $('#cancelPopup').on('click', function (event) {
    event.preventDefault()
    $('#popupOverlay').fadeOut()
  })

  $('#reasonForm').on('submit', function (event) {
    event.preventDefault()
    if (!$('#reason').val()) {
      const messageElement = $('#error-message')
      messageElement.show()
      setTimeout(function () {
        messageElement.hide()
      }, 3000)
    } else {
      $('#error-message').hide()
      this.submit()
    }
  })
})
