/*

/// set Funding code
function getFund(strOrg, dBody, WBTYpe) {
    let strFund;

    if (strOrg === "RPA") {
        strFund = strOrg + "Funds";
        if (["XG", "IP", "INT", "HE"].includes(dBody)) {
            strFund = "EXQFund";
        }
        if (dBody === "IP") {
            strFund = "RPAIPFunds";
        }
        if (dBody === "OPA") {
            strFund = "OPAFunds"; // a-VA02-02 change to accommodate OPA Invoices
        }
        if (dBody === "HE") {
            strFund = "HEFunds";
        }
    } else {
        if (dBody.endsWith("P1")) {
            strFund = "P1Funds";
        } else if (dBody.endsWith("XQ")) {
            strFund = "ExNRDPEFunds";
        } else if (dBody.endsWith("LS") && WBTYpe === "AR") {
            if (["NE", "FC", "RDPE", "RDT"].includes(strOrg)) {
                strFund = "AR_LS_FUNDS";
            } else {
                strFund = "LSFunds";
            }
        } else if (dBody.endsWith("Dom") && WBTYpe === "AR") {
            if (["NE", "FC", "RDPE", "RDT"].includes(strOrg)) {
                strFund = "AR_DOM_FUNDS";
            }
        } else {
            if (strOrg === "RDT" && WBTYpe === "AP") {
                strFund = "RDTNSFunds";
            } else if (dBody === "NECS" && WBTYpe === "AP") {
                strFund = "NECSFunds";
            } else if (WBTYpe === "AR") {
                strFund = "NSARFunds";
            } else {
                strFund = "NSFunds";
            }
        }
        if (strOrg === "FC" && WBTYpe === "AP") {
            strFund = "FCAP"; // v02-05 added to provide EXQ99 for FC AP (pv)
        }
        // a-VA03-00 change to accommodate EA Invoices
        if (dBody.startsWith("EA")) {
            if (dBody.endsWith("CSDom") || WBTYpe === "AP") {
                strFund = "EA_DOM_FUNDS";
            } else {
                strFund = "EAFunds";
            }
        }
    }

    return strFund;
}

// Example usage:
console.log(getFund("RPA", "IP", "AR")); // Output: RPAIPFunds
console.log(getFund("NE", "LS", "AR")); // Output: AR_LS_FUNDS
console.log(getFund("FC", "EA_CSDom", "AP")); // Output: EA_DOM_FUNDS

/// end of funding code

//// set Marketing year
function getMY(dBody) {
    let strMY = "NSMY"; // Default value

    if (dBody === "P1") {
        strMY = "P1MY";
    } else if (dBody === "XQ") {
        strMY = "ExNRDPEMY";
    } else if (dBody === "LS" || dBody.endsWith("LSDom")) {
        strMY = "LSMY";
    } else if (dBody === "CS" || dBody.endsWith("CSDom")) {
        strMY = "NAMY"; // a-VA02-02 request to allow NA for EXQ lines (applies to FC as well)
    } else if (dBody === "SPS" || dBody === "TR") {
        strMY = "LSMY";
    } else if (dBody === "XG") {
        strMY = "XGMY"; // VA02-04 additional ex-Gratia schemes added.
    } else if (dBody === "OPA") {
        strMY = "OPAMY";
    }

    return strMY;
}

// Example usage:
console.log(getMY("P1"));      // Output: P1MY
console.log(getMY("LSDom"));   // Output: LSMY
console.log(getMY("CSDom"));   // Output: NAMY
console.log(getMY("OPA"));     // Output: OPAMY
console.log(getMY("XYZ"));     // Output: NSMY (default)

///end of marketing year

/// set delivery body
function getDB(dBody, strOrg) {
    let strDB;

    if (dBody === "P1") {
        strDB = "P1DBs";
    } else if (dBody === "XQ") {
        strDB = "ExNRDPEDBs";
    } else {
        strDB = strOrg + "DBs";
    }

    return strDB;
}

// Example usage:
console.log(getDB("P1", "RPA"));  // Output: P1DBs
console.log(getDB("XQ", "RPA"));  // Output: ExNRDPEDBs
console.log(getDB("XYZ", "RPA")); // Output: RPADBs

/// end of delivery body

//// set Scheme
function getScheme(dBody, strOrg, WBTYpe) {
    let strSCH;

    if (dBody === "NEP1") {
        strSCH = "P1Schemes";
    } else if (strOrg === "NE" && dBody.endsWith("LS")) {
        if (WBTYpe === "AR") {
            strSCH = "NEARSchemes";
        } else {
            strSCH = "NEAPSchemes"; // Excludes the AR-only schemes for NE
        }
    } else {
        strSCH = dBody + "Schemes"; // Simpler if not NE
    }

    return strSCH;
}

// Example usage:
console.log(getScheme("NEP1", "NE", "AR"));   // Output: P1Schemes
console.log(getScheme("XXLS", "NE", "AR"));   // Output: NEARSchemes
console.log(getScheme("XXLS", "NE", "AP"));   // Output: NEAPSchemes
console.log(getScheme("XYZ", "XX", "AP"));    // Output: XYZSchemes

/// end of scheme

/// set account 
function getAccount(dBody, strOrg, WBTYpe) {
    let strACC;

    if (strOrg !== "NE") {
        if (WBTYpe === "AP") {
            strACC = dBody + "APAccounts"; // Set the Main Account Named Ranges
        } else if (WBTYpe === "AR") {
            strACC = dBody + "ARAccounts";
        }
    } else {
        if (dBody === "NEP1") {
            if (WBTYpe === "AP") {
                strACC = "NEP1APAccounts";
            } else {
                strACC = "NEP1ARAccounts";
            }
        } else if (dBody === "NECS" && WBTYpe === "AP") {
            strACC = "NECSAPAccounts";
        } else if (WBTYpe === "AP") {
            strACC = strOrg + "APAccounts";
        } else {
            if (dBody.endsWith("LS")) {
                strACC = "NELSARAccounts"; // Accommodates LS AR Accounts vs NS AR Accounts
            } else if (dBody.endsWith("LSDom")) {
                strACC = "NELSDomARAccounts";
            } else if (dBody.endsWith("CSDom")) {
                strACC = "NECSDomARAccounts";
            } else {
                strACC = "NEARAccounts"; // Default NE AR Accounts naming
            }
        }
    }

    return strACC;
}

// Example usage:
console.log(getAccount("NEP1", "NE", "AP"));       // Output: NEP1APAccounts
console.log(getAccount("NEP1", "NE", "AR"));       // Output: NEP1ARAccounts
console.log(getAccount("NECS", "NE", "AP"));       // Output: NECSAPAccounts
console.log(getAccount("LS", "NE", "AR"));         // Output: NELSARAccounts
console.log(getAccount("LSDom", "NE", "AR"));      // Output: NELSDomARAccounts
console.log(getAccount("XYZ", "RPA", "AP"));       // Output: XYZAPAccounts
console.log(getAccount("CSDom", "NE", "AR"));      // Output: NECSDomARAccounts

/// end account

/// set coa
function getCoAAndOtherValues(dBody, WBTYpe) {
    let strCoA, strFund, strDB, strMY, strSCH, strACC;

    if (dBody === "NEP1") {
        if (WBTYpe === "AP") {
            strCoA = "P1APCoA"; // Set range for Account/Scheme/Delivery Body combinations
        } else if (WBTYpe === "AR") {
            strCoA = "P1ARCoA";
        }
    } else if (dBody === "RDTDom" && WBTYpe === "AR") {
        strCoA = "RDTDomARCOA";
        strFund = "RDTDomARFunds";
        strDB = "RDTDomDBs";
        strMY = "LSMY";
    } else if (dBody === "RDTEXQ") {
        strSCH = "ExNRDPESchemes";
        if (WBTYpe === "AP") {
            strCoA = "ExNRDPEAPCoA"; // Set range for Account/Scheme/Delivery Body combinations
            strACC = "ExNRDPEAPAccounts"; // Set the Main Account Named Ranges
        } else if (WBTYpe === "AR") {
            strCoA = "ExNRDPEARCoA";
            strACC = "ExNRDPEARAccounts";
        }
    } else {
        if (WBTYpe === "AP") {
            strCoA = dBody + "APCoA"; // Set range for Account/Scheme/Delivery Body combinations
        } else if (WBTYpe === "AR") {
            strCoA = dBody + "ARCoA";
        }
    }

    return {
        strCoA,
        strFund,
        strDB,
        strMY,
        strSCH,
        strACC
    };
}

// Example usage:
console.log(getCoAAndOtherValues("NEP1", "AP")); 
// Output: { strCoA: 'P1APCoA', strFund: undefined, strDB: undefined, strMY: undefined, strSCH: undefined, strACC: undefined }

console.log(getCoAAndOtherValues("RDTDom", "AR")); 
// Output: { strCoA: 'RDTDomARCOA', strFund: 'RDTDomARFunds', strDB: 'RDTDomDBs', strMY: 'LSMY', strSCH: undefined, strACC: undefined }

console.log(getCoAAndOtherValues("RDTEXQ", "AP")); 
// Output: { strCoA: 'ExNRDPEAPCoA', strFund: undefined, strDB: undefined, strMY: undefined, strSCH: 'ExNRDPESchemes', strACC: 'ExNRDPEAPAccounts' }

console.log(getCoAAndOtherValues("XYZ", "AP")); 
// Output: { strCoA: 'XYZAPCoA', strFund: undefined, strDB: undefined, strMY: undefined, strSCH: undefined, strACC: undefined }

/// end coa

*/