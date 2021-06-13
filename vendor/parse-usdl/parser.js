// MIT License

// Author : https://github.com/mvayngrib/parse-usdl

// Copyright (c) 2019 Tradle, Inc

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const CodeToKey = {
    DAA: 'Full Name',
    DAB: 'Last Name',
    DAB: 'Family Name',
    DAC: 'First Name',
    DAC: 'Given Name',
    DAD: 'Middle Name or Initial',
    DAD: 'Middle Name',
    DAE: 'Name Suffix',
    DAF: 'Name Prefix',
    DAG: 'Mailing Street Address1',
    DAH: 'Mailing Street Address2',
    DAI: 'Mailing City',
    DAJ: 'Mailing Jurisdiction Code',
    DAK: 'Mailing Postal Code',
    DAL: 'Residence Street Address1',
    DAM: 'Residence Street Address2',
    DAN: 'Residence City',
    DAO: 'Residence Jurisdiction Code',
    DAP: 'Residence Postal Code',
    DAQ: 'License or ID Number',
    DAR: 'License Classification Code',
    DAS: 'License Restriction Code',
    DAT: 'License Endorsements Code',
    DAU: 'Height in FT_IN',
    DAV: 'Height in CM',
    DAW: 'Weight in LBS',
    DAX: 'Weight in KG',
    DAY: 'Eye Color',
    DAZ: 'Hair Color',
    DBA: 'License Expiration Date',
    DBB: 'Date of Birth',
    DBC: 'Sex',
    DBD: 'License or ID Document Issue Date',
    DBE: 'Issue Timestamp',
    DBF: 'Number of Duplicates',
    DBG: 'Medical Indicator Codes',
    DBH: 'Organ Donor',
    DBI: 'Non-Resident Indicator',
    DBJ: 'Unique Customer Identifier',
    DBK: 'Social Security Number',
    DBL: 'Date Of Birth',
    DBM: 'Social Security Number',
    DBN: 'Full Name',
    DBO: 'Last Name',
    DBO: 'Family Name',
    DBP: 'First Name',
    DBP: 'Given Name',
    DBQ: 'Middle Name',
    DBQ: 'Middle Name or Initial',
    DBR: 'Suffix',
    DBS: 'Prefix',
    DCA: 'Virginia Specific Class',
    DCB: 'Virginia Specific Restrictions',
    DCD: 'Virginia Specific Endorsements',
    DCE: 'Physical Description Weight Range',
    DCF: 'Document Discriminator',
    DCG: 'Country territory of issuance',
    DCH: 'Federal Commercial Vehicle Codes',
    DCI: 'Place of birth',
    DCJ: 'Audit information',
    DCK: 'Inventory Control Number',
    DCL: 'Race Ethnicity',
    DCM: 'Standard vehicle classification',
    DCN: 'Standard endorsement code',
    DCO: 'Standard restriction code',
    DCP: 'Jurisdiction specific vehicle classification description',
    DCQ: 'Jurisdiction-specific',
    DCR: 'Jurisdiction specific restriction code description',
    DCS: 'Family Name',
    DCS: 'Last Name',
    DCT: 'Given Name',
    DCT: 'First Name',
    DCU: 'Suffix',
    DDA: 'Compliance Type',
    DDB: 'Card Revision Date',
    DDC: 'HazMat Endorsement Expiry Date',
    DDD: 'Limited Duration Document Indicator',
    DDE: 'Family Name Truncation',
    DDF: 'First Names Truncation',
    DDG: 'Middle Names Truncation',
    DDH: 'Under 18 Until',
    DDI: 'Under 19 Until',
    DDJ: 'Under 21 Until',
    DDK: 'Organ Donor Indicator',
    DDL: 'Veteran Indicator',
    PAA: 'Permit Classification Code',
    PAB: 'Permit Expiration Date',
    PAC: 'Permit Identifier',
    PAD: 'Permit IssueDate',
    PAE: 'Permit Restriction Code',
    PAF: 'Permit Endorsement Code',
    ZVA: 'Court Restriction Code',

    // Extras
    ZCB: 'Hair',
    ZCC: 'Misc',
    ZCD: 'Misc'
}

const lineSeparator = '\n'
const defaultOptions = { suppressErrors: false }
function parseCode128(str, options = defaultOptions) {
    const props = {}
    const rawLines = str.trim().split(lineSeparator)
    const lines = rawLines.map((rawLine) => sanitizeData(rawLine))
    let started
    lines.slice(0, -1).forEach((line) => {
        if (!started) {
            if (line.indexOf('ANSI ') === 0) {
                started = true
            }
            return
        }

        let code = getCode(line)
        let value = getValue(line)
        let key = getKey(code)
        if (!key) {
            if (options.suppressErrors) {
                return
            } else {
                throw new Error('unknown code: ' + code)
            }
        }

        if (isSexField(code)) value = getSex(code, value)

        props[key] = isDateField(key) ? getDateFormat(value) : value
    })

    return props
}

const sanitizeData = (rawLine) =>
    rawLine
        .match(/[\011\012\015\040-\177]*/g)
        .join('')
        .trim()

const getCode = (line) => line.slice(0, 3)
const getValue = (line) => line.slice(3)
const getKey = (code) => CodeToKey[code]

const isSexField = (code) => code === 'DBC'

const getSex = (code, value) => (value === '1' ? 'M' : 'F')

const isDateField = (key) => key.indexOf('date') === 0

const getDateFormat = (value) => {
    const [mm, dd, yyyy] = [value.slice(0, 2), value.slice(2, 4), value.slice(4)]
    return `${yyyy}-${mm}-${dd}`
}