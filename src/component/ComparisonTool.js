import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Autocomplete,
  Box,
  Input,
  Container,
  Grid,
  Typography,
  Select,
  MenuItem,
  Button,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
} from "@mui/material";
import {
  OprationName,
  TimeOption,
  locationName,
  stateData,
} from "../utils/State";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function ComparisonTool() {
  const [selectedStates, setSelectedStates] = useState(["", ""]);
  const [selectedLocations, setSelectedLocations] = useState(["", ""]);
  const [selectedOperators, setSelectedOperators] = useState(["", ""]);
  const [selectedYears, setSelectedYears] = useState(["", ""]);

  // State for comparison results
  const [comparisonResults, setComparisonResults] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  const excelSerialToDate = (serial) => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000; // Milliseconds in a day
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch (December 31, 1899)
    const dateMilliseconds = excelEpoch.getTime() + serial * MS_PER_DAY;

    return new Date(dateMilliseconds);
  };

  const excelSerialToYear = (serial) => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const dateMilliseconds = excelEpoch.getTime() + serial * MS_PER_DAY;
    return new Date(dateMilliseconds).getUTCFullYear();
  };

  const yearToExcelSerial = (year) => {
    const targetDate = new Date(Date.UTC(year, 0, 1)); // January 1st of the target year
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch (December 31, 1899)
    const msPerDay = 24 * 60 * 60 * 1000; // Milliseconds per day
    const daysSinceEpoch = (targetDate - excelEpoch) / msPerDay;
    return daysSinceEpoch;
  };

  const convertDateToString = (date) => {
    const year = date.getUTCFullYear();
    return year.toString();
  };

  const handleGenerateReport = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet);

      const targetYear = parseInt(selectedYears[0]); // Assuming you're only selecting one year
      const targetYearSerial = yearToExcelSerial(targetYear);

      const filtered = excelData.filter((row) => {
        const startInSeconds = parseInt(row["Date Test Start"]);
        const endInSeconds = parseInt(row["Date Test End"]);

        const stateMatches = selectedStates.includes(row["Emirate"]);
        const locationMatches = selectedLocations.includes(
          row["Location Name"]
        );
        const operatorMatches = selectedOperators.includes(row["Operator"]);
        const yearMatches = selectedYears.includes(
          convertDateToString(excelSerialToDate(row["Date Test Start"]))
        );
        // const yearMatches = targetYearSerial >= startInSeconds && targetYearSerial <= endInSeconds;
        // const yearMatches = targetYearSerial >= startInSeconds && targetYearSerial <= endInSeconds;

        console.log(
          "Row:",
          row,
          "Emirate:",
          row["Emirate"],
          "Location:",
          row["Location Name"],
          "Operator:",
          row["Operator"],
          "Operator23:",
          selectedYears,
          "Operator12:",
          convertDateToString(excelSerialToDate(row["Date Test Start"])),
          "targetYear1:",
          targetYear,
          "targetYear2:",
          selectedYears.includes(
            convertDateToString(excelSerialToDate(row["Date Test Start"]))
          ),
          "targetYearSerial:",
          targetYearSerial,
          "Start Time (sec):",
          startInSeconds,
          "End Time (sec):",
          endInSeconds,
          "State Matches:",
          stateMatches,
          "Location Matches:",
          locationMatches,
          "Operator Matches:",
          operatorMatches
          //   "Year Matches:", yearMatches
        );

        return (
          stateMatches && locationMatches && operatorMatches && yearMatches
        );
        // return stateMatches && locationMatches && operatorMatches;
      });

      setFilteredData(filtered);
    };

    reader.readAsBinaryString(file);
  };

  console.log(filteredData, "filteredData");

  const downloadExcelSheet = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const exportData = filteredData.map((item) => {
      return {
        // Define here the keys of the object you want to include in the Excel sheet
        // For example:
        Emirate: item.Emirate,
        "Location Name": item["Location Name"],
        Operator: item.Operator,
        "Date Test Start": convertDateToString(
          excelSerialToDate(item["Date Test Start"])
        ),
        "Date Test End": convertDateToString(
          excelSerialToDate(item["Date Test End"])
        ),
        "2G Coverage Reliability (%)": item["2G Coverage Reliability (%)"],
        "3G Coverage Reliability (%)": item["3G Coverage Reliability (%)"],
        "4G Coverage Reliability (%)": item["4G Coverage Reliability (%)"],
        "Call Setup Success Rate (%)": item["Call Setup Success Rate (%)"],
        "Call Completion Success Rate (%)":
          item["Call Completion Success Rate (%)"],
        "Call Drop Rate (%)": item["Call Drop Rate (%)"],
        "Downlink MOS": item["Downlink MOS"],
        "FTP_Downlink Throughput (Mbps)":
          item["FTP_Downlink Throughput (Mbps)"],
        "FTP_Uplink Throughput (Mbps)": item["FTP_Uplink Throughput (Mbps)"],
        "HTTP_Downlink Throughput (Mbps)":
          item["HTTP_Downlink Throughput (Mbps)"],
        "HTTP_Uplink Throughput (Mbps)": item["HTTP_Uplink Throughput (Mbps)"],
        // Add other fields as needed
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: fileType });
    const fileName = "filteredData" + fileExtension;
    saveAs(data, fileName);
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Issue Count Application</Typography>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ maxWidth: "400px" }}>
            <Accordion sx={{ p: 3 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Select option </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {selectedStates.map((state, index) => (
                  <Autocomplete
                    key={index}
                    disablePortal
                    value={state}
                    onChange={(event, newValue) => {
                      const updatedStates = [...selectedStates];
                      updatedStates[index] = newValue;
                      setSelectedStates(updatedStates);
                    }}
                    options={stateData}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                      <TextField {...params} label={`State ${index + 1}`} />
                    )}
                  />
                ))}
              </AccordionDetails>

              {/* Allow selection for two locations */}
              <AccordionDetails>
                {selectedLocations.map((location, index) => (
                  <Autocomplete
                    key={index}
                    disablePortal
                    value={location}
                    onChange={(event, newValue) => {
                      const updatedLocations = [...selectedLocations];
                      updatedLocations[index] = newValue;
                      setSelectedLocations(updatedLocations);
                    }}
                    options={locationName}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                      <TextField {...params} label={`Location ${index + 1}`} />
                    )}
                  />
                ))}
              </AccordionDetails>

              {/* Allow selection for two operators */}
              <AccordionDetails>
                {selectedOperators.map((operator, index) => (
                  <Autocomplete
                    key={index}
                    disablePortal
                    value={operator}
                    onChange={(event, newValue) => {
                      const updatedOperators = [...selectedOperators];
                      updatedOperators[index] = newValue;
                      setSelectedOperators(updatedOperators);
                    }}
                    options={OprationName}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                      <TextField {...params} label={`Operator ${index + 1}`} />
                    )}
                  />
                ))}
              </AccordionDetails>

              {/* Allow selection for two years */}
              <AccordionDetails>
                {selectedYears.map((year, index) => (
                  <Autocomplete
                    key={index}
                    disablePortal
                    value={year}
                    onChange={(event, newValue) => {
                      const updatedYears = [...selectedYears];
                      updatedYears[index] = newValue;
                      setSelectedYears(updatedYears);
                    }}
                    options={TimeOption}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                      <TextField {...params} label={`Year ${index + 1}`} />
                    )}
                  />
                ))}
              </AccordionDetails>
            </Accordion>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Input id="fileInput" type="file" sx={{ border: "1px solid" }} />

              <Button variant="contained" onClick={handleGenerateReport}>
                Compare
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={3}></Grid>
        <Grid item xs={12} sx={{ m: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">Report Data</Typography>
            {filteredData.length > 0 && (
              <Button variant="contained" onClick={downloadExcelSheet}>
                Download
              </Button>
            )}
          </Box>

          {filteredData.length > 0 ? (
            <Box>
              <table border="1">
                <thead>
                  <tr>
                    {filteredData.length > 0 &&
                      Object.keys(filteredData[0]).map((key, index) => (
                        <th key={index}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 &&
                    filteredData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <td key={cellIndex}>
                            {key.includes("Date")
                              ? convertDateToString(excelSerialToDate(value))
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box>
              <Typography variant="h4"></Typography>
              <Typography variant="subtitle2">
                You Have no Data Please section Option and Click on Generate
                Report
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
