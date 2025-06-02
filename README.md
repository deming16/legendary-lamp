# Web scrapping property listings in district 3 and 5

## Background

This mini project allows us to scrap property listing data from [PropertyGuru](https://www.propertyguru.com.sg/). In this scenario, we will look at the private condominum listings of 2 of the most popular district in Singapore (District 3 and 5)

For other deliverables such as the technical design description and summary report, refer to:

- [Technical Design](./report/report.md)
- [Summary Report](./report/summaryReport.md)
- [Extracted Data](./report/extractedData.json)

## Installation

```bash
npm install
```

## Usage

Run the crawler:

```bash
npm start
```

## Configuration

You can customize the crawler behavior by editing the `config.json` file

### Example Configuration

```json
{
  "params": {
    "listingType": "sale",
    "propertyTypeGroup": "N",
    "propertyTypeCode": "CONDO",
    "isCommercial": "false",
    "districtCode": ["D03", "D05"]
  },
  "pages": 50,
  "delay": 500,
  "timeout": 30000,
  "retries": 10,
  "concurrency": 2
}
```

## Output

The crawler will save extracted data to the specified output directory (default: `./data`) in JSON format.
