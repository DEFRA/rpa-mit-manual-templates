/* global $, deliveryBodyData, accounttype, schemecodeData, invoiceTemplate, invoiceTemplateSecondaryData, optionsAll, dropdownAll*/

$(function () {
  $('#approverForm').on('submit', function (event) {
    event.preventDefault()
    let allGroupsSelected = false
    const inputs = document.querySelectorAll('.approver_inputs')
    const inputs2 = document.querySelectorAll('.govuk-checkboxes__input')

    for (const input of inputs2) {
      if (input.checked) {
        allGroupsSelected = true
      }
    }

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

  $('#searchForm').on('submit', function (event) {
    event.preventDefault()
    const allGroupsSelected = []
    const inputs = document.querySelectorAll('.approver_inputs')
    console.log(inputs)
    for (const input of inputs) {
      if (input.value.trim() === '') {
        allGroupsSelected.push(true)
      } else {
        allGroupsSelected.push(false)
      }
    }

    if (!allGroupsSelected.includes(false)) {
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
    if (!allGroupsSelected || ard.length < 4) {
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

  $('#popupOverlayError').fadeIn()
  $('#cancelPopupError').on('click', function (event) {
    event.preventDefault()
    $('#popupOverlayError').fadeOut()
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
                if(invoiceTemplateSecondaryData && deliveryBodyOptionsUnique[this.value][0].org == "RPA")
                {
                  updateBodyOptions(this.value, 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question')
                }
                else
                {
                  updateBodyOptions('', 'invoice-template-secondary-body-container', 'invoice_template_secondary', 'Select Scheme Invoice Template Secondary Question')
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

  try {
    // let actype = accounttype;
    function getDescription (optionsData) {
      let description = ''
      const payload = { mainaccount: $('#mainaccount').val(), deliverybody: $('#deliverybody').val(), schemecode: $('#schemecode').val() }
      if (payload.mainaccount && payload.deliverybody && payload.schemecode) {
        description = optionsData.referenceData.chartOfAccounts?.find(data => ((data?.code || '') === (payload.mainaccount + '/' + payload.schemecode + '/' + payload.deliverybody)))?.description || ''
        if (!description) {
          description = `${(optionsData.referenceData.accountCodes?.find(data => ((data?.code || '') === payload.mainaccount))?.description || '')} ${(optionsData.referenceData.schemeCodes?.find(data => ((data?.code || '') === payload.schemecode))?.description || '')} ${(optionsData.referenceData.deliveryBodies?.find(data => ((data?.code || '') === payload.deliverybody))?.description || '')}`
        }
        $('#description').val(description)
      }
    }
    // getFund('', $('#deliverybody').val(),actype.toUpperCase())
    // getMY($('#deliverybody').val())
    // getScheme($('#deliverybody').val(),'',actype.toUpperCase())
    // getAccount($('#deliverybody').val(),'',actype.toUpperCase()) 
    getDescription(optionsAll)
    $('#mainaccount').on('change', function () {
      getDescription(optionsAll)
    })

    $('#schemecode').on('change', function () {
      getDescription(optionsAll)
    })

    $('#deliverybody').on('change', function () {
      getDescription(optionsAll)

      // getFund('', $('#deliverybody').val(),actype.toUpperCase())
      // getMY($('#deliverybody').val())
      // getScheme($('#deliverybody').val(),'',actype.toUpperCase())
      // getAccount($('#deliverybody').val(),'',actype.toUpperCase()) 
    })

   
  //   function getFund(strOrg, dBody, WBTYpe) {
  //     if(optionsDropdowns ==  null) return;
  //     let strFund;
  //     if (strOrg === "RPA") {
  //         strFund = strOrg + "Funds";
  //         if (["XG", "IP", "INT", "HE"].includes(dBody)) {
  //             strFund = "EXQFund";
  //         }
  //         if (dBody === "IP") {
  //             strFund = "RPAIPFunds";
  //         }
  //         if (dBody === "OPA") {
  //             strFund = "OPAFunds";
  //         }
  //         if (dBody === "HE") {
  //             strFund = "HEFunds";
  //         }
  //     } else {
  //         if (dBody.endsWith("P1")) {
  //             strFund = "P1Funds";
  //         } else if (dBody.endsWith("XQ")) {
  //             strFund = "ExNRDPEFunds";
  //         } else if (dBody.endsWith("LS") && WBTYpe === "AR") {
  //             if (["NE", "FC", "RDPE", "RDT"].includes(strOrg)) {
  //                 strFund = "AR_LS_FUNDS";
  //             } else {
  //                 strFund = "LSFunds";
  //             }
  //         } else if (dBody.endsWith("Dom") && WBTYpe === "AR") {
  //             if (["NE", "FC", "RDPE", "RDT"].includes(strOrg)) {
  //                 strFund = "AR_DOM_FUNDS";
  //             }
  //         } else {
  //             if (strOrg === "RDT" && WBTYpe === "AP") {
  //                 strFund = "RDTNSFunds";
  //             } else if (dBody === "NECS" && WBTYpe === "AP") {
  //                 strFund = "NECSFunds";
  //             } else if (WBTYpe === "AR") {
  //                 strFund = "NSARFunds";
  //             } else {
  //                 strFund = "NSFunds";
  //             }
  //         }
  //         if (strOrg === "FC" && WBTYpe === "AP") {
  //             strFund = "FCAP"; 
  //         }
  //         if (dBody.startsWith("EA")) {
  //             if (dBody.endsWith("CSDom") || WBTYpe === "AP") {
  //                 strFund = "EA_DOM_FUNDS";
  //             } else {
  //                 strFund = "EAFunds";
  //             }
  //         }
  //     }
  //     const allfundcode = $('#fundcode');
  //     allfundcode.empty();
  //     optionsDropdowns[strFund].split(",").forEach(val => {
  //     allfundcode.append($('<option>', {
  //       value: val,
  //       text: val
  //     }));
  //     });
  // }
  
  // function getMY(dBody) {
  //   if(optionsDropdowns ==  null) return;

  //     let strMY = "NSMY";
  //     if (dBody === "P1") {
  //         strMY = "P1MY";
  //     } else if (dBody === "XQ") {
  //         strMY = "ExNRDPEMY";
  //     } else if (dBody === "LS" || dBody.endsWith("LSDom")) {
  //         strMY = "LSMY";
  //     } else if (dBody === "CS" || dBody.endsWith("CSDom")) {
  //         strMY = "NAMY"; 
  //     } else if (dBody === "SPS" || dBody === "TR") {
  //         strMY = "LSMY";
  //     } else if (dBody === "XG") {
  //         strMY = "XGMY";
  //     } else if (dBody === "OPA") {
  //         strMY = "OPAMY";
  //     }
  //     const allmarketingyear = $('#marketingyear');
  //     allmarketingyear.empty();
  //     optionsDropdowns[strMY].split(",").forEach(val => {
  //       allmarketingyear.append($('<option>', {
  //       value: val,
  //       text: val
  //     }));
  //     });
  // }
  
  // function getDB(dBody, strOrg) {
  //     let strDB;
  //     if (dBody === "P1") {
  //         strDB = "P1DBs";
  //     } else if (dBody === "XQ") {
  //         strDB = "ExNRDPEDBs";
  //     } else {
  //         strDB = strOrg + "DBs";
  //     }
  //     return strDB;
  // }
  
  // function getScheme(dBody, strOrg, WBTYpe) {
  //   if(optionsDropdowns ==  null) return;

  //     let strSCH;
  //     if (dBody === "NEP1") {
  //         strSCH = "P1Schemes";
  //     } else if (strOrg === "NE" && dBody.endsWith("LS")) {
  //         if (WBTYpe === "AR") {
  //             strSCH = "NEARSchemes";
  //         } else {
  //             strSCH = "NEAPSchemes";
  //         }
  //     } else {
  //         strSCH = dBody + "Schemes"; 
  //     }

  //     const allschemecode = $('#schemecode');
  //     allschemecode.empty();
  //     optionsDropdowns[strSCH].split(",").forEach(val => {
  //       allschemecode.append($('<option>', {
  //       value: val,
  //       text: val
  //     }));
  //     });
     
  // }
  
  // function getAccount(dBody, strOrg, WBTYpe) {
  //   if(optionsDropdowns ==  null) return;

  //     let strACC;
  //     if (strOrg !== "NE") {
  //         if (WBTYpe === "AP") {
  //             strACC = dBody + "APAccounts"; 
  //         } else if (WBTYpe === "AR") {
  //             strACC = dBody + "ARAccounts";
  //         }
  //     } else {
  //         if (dBody === "NEP1") {
  //             if (WBTYpe === "AP") {
  //                 strACC = "NEP1APAccounts";
  //             } else {
  //                 strACC = "NEP1ARAccounts";
  //             }
  //         } else if (dBody === "NECS" && WBTYpe === "AP") {
  //             strACC = "NECSAPAccounts";
  //         } else if (WBTYpe === "AP") {
  //             strACC = strOrg + "APAccounts";
  //         } else {
  //             if (dBody.endsWith("LS")) {
  //                 strACC = "NELSARAccounts"; 
  //             } else if (dBody.endsWith("LSDom")) {
  //                 strACC = "NELSDomARAccounts";
  //             } else if (dBody.endsWith("CSDom")) {
  //                 strACC = "NECSDomARAccounts";
  //             } else {
  //                 strACC = "NEARAccounts"; 
  //             }
  //         }
  //     }

  //     const allmainaccount = $('#mainaccount');
  //     allmainaccount.empty();
  //     optionsDropdowns[strACC].split(",").forEach(val => {
  //       allmainaccount.append($('<option>', {
  //       value: val,
  //       text: val
  //     }));
  //     });
      
  // }
  
  // function getCoAAndOtherValues(dBody, WBTYpe) {
  //     let strCoA, strFund, strDB, strMY, strSCH, strACC;
  //     if (dBody === "NEP1") {
  //         if (WBTYpe === "AP") {
  //             strCoA = "P1APCoA"; 
  //         } else if (WBTYpe === "AR") {
  //             strCoA = "P1ARCoA";
  //         }
  //     } else if (dBody === "RDTDom" && WBTYpe === "AR") {
  //         strCoA = "RDTDomARCOA";
  //         strFund = "RDTDomARFunds";
  //         strDB = "RDTDomDBs";
  //         strMY = "LSMY";
  //     } else if (dBody === "RDTEXQ") {
  //         strSCH = "ExNRDPESchemes";
  //         if (WBTYpe === "AP") {
  //             strCoA = "ExNRDPEAPCoA";
  //             strACC = "ExNRDPEAPAccounts";
  //         } else if (WBTYpe === "AR") {
  //             strCoA = "ExNRDPEARCoA";
  //             strACC = "ExNRDPEARAccounts";
  //         }
  //     } else {
  //         if (WBTYpe === "AP") {
  //             strCoA = dBody + "APCoA";
  //         } else if (WBTYpe === "AR") {
  //             strCoA = dBody + "ARCoA";
  //         }
  //     }
  //     return {
  //         strCoA,
  //         strFund,
  //         strDB,
  //         strMY,
  //         strSCH,
  //         strACC
  //     };
  // }
  } catch (e) {
  }

  // try {
  //   const orgdelivery = deliverybodyData.find(data => (data.code === $('#deliverybody').val()))?.org
  //   $('#schemecode').val(schemecodeData.find(data => ((data?.org || '') === orgdelivery)).code)

  //   $('#schemecode').on('change', function () {
  //     const orgscheme = schemecodeData.find(data => (data.code === $('#schemecode').val()))?.org || ''
  //     $('#deliverybody').val(deliverybodyData.find(data => (data.org === orgscheme)).code)
  //   })

  //   $('#deliverybody').on('change', function () {
  //     const orgdelivery = deliverybodyData.find(data => (data.code === $('#deliverybody').val()))?.org
  //     $('#schemecode').val(schemecodeData.find(data => ((data?.org || '') === orgdelivery)).code)
  //   })
  // } catch (e) {
  //   console.log(e)
  // }

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
