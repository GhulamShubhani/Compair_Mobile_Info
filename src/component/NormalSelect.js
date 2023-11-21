import {
    Container,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Autocomplete,
    Box,
    Button,
    Input,
  } from "@mui/material";
  import React, { useState } from "react";
  import * as XLSX from "xlsx";
  import {
    OprationName,
    TimeOption,
    locationName,
    stateData,
  } from "../utils/State";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import { saveAs } from "file-saver";
  
  function NormalSelect() {
    const [selectState, setSelectState] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedOperator, setSelectedOperator] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [filteredData, setFilteredData] = useState([]);
  
    const excelSerialToDate = (serial) => {
      const MS_PER_DAY = 24 * 60 * 60 * 1000; // Milliseconds in a day
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch (December 31, 1899)
      const dateMilliseconds = excelEpoch.getTime() + serial * MS_PER_DAY;
  
      return new Date(dateMilliseconds);
    };
  
    const convertDateToString = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
  
      return `${year}-${month}-${day}`;
    };
  
    const handleGenerateReport = () => {
      const fileInput = document.getElementById("fileInput");
      const file = fileInput.files[0];
      const reader = new FileReader();
  
      reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
  
        const filtered = excelData.filter((row) => {
          const excelSerial = parseInt(row["Date Test Start"]); // Convert to integer
          const date = excelSerialToDate(excelSerial);
          const formattedDate = convertDateToString(date);
          const rowYear = formattedDate.substring(0, 4);
  
          if (selectState && row["Emirate"] !== selectState) return false;
          if (selectedLocation && row["Location Name"] !== selectedLocation)
            return false;
          if (selectedOperator && row["Operator"] !== selectedOperator)
            return false;
          if (rowYear !== selectedYear) return false;
  
          return true;
        });
  
        setFilteredData(filtered);
      };
  
      reader.readAsBinaryString(file);
    };
  
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
          "Date Test Start": convertDateToString(excelSerialToDate(item["Date Test Start"])),
      "Date Test End": convertDateToString(excelSerialToDate(item["Date Test End"])),
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
      <>
        <Container>
          <Grid container sx={{ my: 3 }}>
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
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      value={selectState}
                      onChange={(event, newValue) => setSelectState(newValue)}
                      options={stateData}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="State" />
                      )}
                    />
                  </AccordionDetails>
                  <AccordionDetails>
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      value={selectedLocation}
                      onChange={(event, newValue) =>
                        setSelectedLocation(newValue)
                      }
                      options={locationName}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Location" />
                      )}
                    />
                  </AccordionDetails>
                  <AccordionDetails>
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      value={selectedOperator}
                      onChange={(event, newValue) =>
                        setSelectedOperator(newValue)
                      }
                      options={OprationName}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="operator" />
                      )}
                    />
                  </AccordionDetails>
                  <AccordionDetails>
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      value={selectedYear}
                      onChange={(event, newValue) => setSelectedYear(newValue)}
                      options={TimeOption}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Year" />
                      )}
                    />
                  </AccordionDetails>
                </Accordion>
  
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Input
                    id="fileInput"
                    type="file"
                    sx={{ border: "1px solid" }}
                  />
  
                  <Button variant="contained" onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </Box>
              </Box>
            </Grid>
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
                            {Object.entries(row).map(
                              ([key, value], cellIndex) => (
                                <td key={cellIndex}>
                                  {key.includes("Date")
                                    ? convertDateToString(
                                        excelSerialToDate(value)
                                      )
                                    : value}
                                </td>
                              )
                            )}
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
      </>
    );
  }
  
  export default NormalSelect;
  