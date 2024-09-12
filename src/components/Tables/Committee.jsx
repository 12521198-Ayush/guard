'use client'

import * as React from 'react';
import { closest, isNullOrUndefined } from '@syncfusion/ej2-base';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Filter, VirtualScroll, Sort } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { RatingComponent } from '@syncfusion/ej2-react-inputs';
import { DataManager, Query, UrlAdaptor } from '@syncfusion/ej2-data';
import Image from "next/image";

import './grid-overview.css';
function statusTemplate(props) {
    return (<div>{props.Status === "Active" ?
            <div id="status" className="statustemp e-activecolor">
    <span className="statustxt e-activecolor">{props.Status}</span>
  </div> :
            <div id="status" className="statustemp e-inactivecolor">
    <span className="statustxt e-inactivecolor">{props.Status}</span>
  </div>}</div>);
}
function ratingTemplate(props) {
    return (<div><RatingComponent value={props.Rating} cssClass={'custom-rating'} readOnly={true}/></div>);
}
function progessTemplate(props) {
    let percentage = props[props.column.field];
    if (percentage <= 20) {
        percentage = percentage + 30;
    }
    return (<div id="myProgress" className="pbar">
    {props.Status === "Inactive" ?
            <div id="myBar" className="bar progressdisable" style={{ width: percentage + "%" }}>
      <div id="pbarlabel" className="barlabel">{percentage + "%"}</div>
    </div> :
            <div id="myBar" className="bar" style={{ width: percentage + "%" }}>
      <div id="pbarlabel" className="barlabel">{percentage + "%"}</div>
    </div>}
    </div>);
}
let loc = { width: '31px', height: '24px' };
function trustTemplate(props) {
    var Trustworthiness = props.Trustworthiness == "Sufficient" ? 'src/grid/images/Sufficient.png' : props.Trustworthiness == "Insufficient" ? 'src/grid/images/Insufficient.png' : 'src/grid/images/Perfect.png';
    return (<div> <Image style={loc} src={Trustworthiness} alt=""/>
    <span id="Trusttext">{props.Trustworthiness}</span></div>);
}
function empTemplate(props) {
    return (<div>
    {props.EmployeeImg === 'usermale' ?
            <div className="empimg">
          <span className="e-userimg sf-icon-Male"/>
        </div> :
            <div className="empimg">
          <span className="e-userimg sf-icon-FeMale"/>
        </div>}
    <span id="Emptext">{props.Employees}</span>
  </div>);
}
function coltemplate(props) {
    return (<div className="Mapimage">
    <Image src="src/grid/images/Map.png" className="e-image" alt=""/> <span>  </span>
    <span id="locationtext">{props.Location}</span>
  </div>);
}
function trustdetails(props) {
    if (props.Trustworthiness === "Select All") {
        return (<span></span>);
    }
    let loc = { width: '31px', height: '24px' };
    let Trustworthiness = props.Trustworthiness == "Sufficient" ? 'src/grid/images/Sufficient.png' : props.Trustworthiness == "Insufficient" ? 'src/grid/images/Insufficient.png' : 'src/grid/images/Perfect.png';
    return (<div><Image style={loc} src={Trustworthiness} alt=""/> <span id="Trusttext">{props.Trustworthiness}</span></div>);
}
function ratingDetails(props) {
    return (<RatingComponent value={props.Rating} cssClass={'custom-rating'} readOnly={true}/>);
}
function statusdetails(props) {
    if (props.Status === "Select All") {
        return (<span>Select All</span>);
    }
    if (props.Status === "Active") {
        return (<div className="statustemp e-activecolor">
        <span className="statustxt e-activecolor">Active</span>
      </div>);
    }
    if (props.Status === "Inactive") {
        return (<div className="statustemp e-inactivecolor">
        <span className="statustxt e-inactivecolor">Inactive</span>
      </div>);
    }
}
function OverView() {
    let dReady = false;
    let dtTime = false;
    let isDataBound = false;
    let isDataChanged = true;
    let intervalFun;
    let clrIntervalFun;
    let clrIntervalFun1;
    let clrIntervalFun2;
    let dropSlectedIndex = null;
    let ddObj;
    let gridInstance;
    let stTime;
    const ddlData = [
        { text: '1,000 Rows and 11 Columns', value: '1000' },
        { text: '10,000 Rows and 11 Columns', value: '10000' },
        { text: '1,00,000 Rows and 11 Columns', value: '100000' }
    ];
    const fields = { text: 'text', value: 'value' };
    function onDataBound() {
        clearTimeout(clrIntervalFun);
        clearInterval(intervalFun);
        dtTime = true;
    }
    function onComplete(args) {
        if (args.requestType === "filterchoicerequest") {
            if (args.filterModel.options.field === "Trustworthiness" || args.filterModel.options.field === "Rating" || args.filterModel.options.field === "Status") {
                var span = args.filterModel.dialogObj.element.querySelectorAll('.e-selectall')[0];
                if (!isNullOrUndefined(span)) {
                    closest(span, '.e-ftrchk').classList.add("e-hide");
                }
            }
        }
    }
    const hostUrl = 'https://services.syncfusion.com/react/production/';
    const data = new DataManager({ url: hostUrl + 'api/UrlDataSource', adaptor: new UrlAdaptor });
    const query = new Query().addParams('dataCount', '1000');
    function onChange() {
        ddObj.hidePopup();
        dropSlectedIndex = null;
        let index = ddObj.value;
        clearTimeout(clrIntervalFun2);
        clrIntervalFun2 = setTimeout(() => {
            isDataChanged = true;
            stTime = null;
            let contentElement = gridInstance.contentModule.getPanel().firstChild;
            contentElement.scrollLeft = 0;
            contentElement.scrollTop = 0;
            gridInstance.pageSettings.currentPage = 1;
            stTime = performance.now();
            if (gridInstance.query.params.length > 1) {
                for (let i = 0; i < gridInstance.query.params.length; i++) {
                    if (gridInstance.query.params[i].key === 'dataCount') {
                        gridInstance.query.params[i].value = index.toString();
                        break;
                    }
                }
            }
            else {
                gridInstance.query.params[0].value = index.toString();
            }
            gridInstance.setProperties({ dataSource: data });
        }, 100);
    }
    const check = {
        type: 'CheckBox'
    };
    const select = {
        persistSelection: true,
        type: "Multiple",
        checkboxOnly: true
    };
    function onLoad(args) {
        document.getElementById('overviewgrid').ej2_instances[0].on('data-ready', () => {
            dReady = true;
            stTime = performance.now();
        });
        var observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                if (dReady && stTime && isDataChanged) {
                    let msgEle = document.getElementById('msg');
                    let val = (performance.now() - stTime).toFixed(0);
                    stTime = null;
                    dReady = false;
                    dtTime = false;
                    isDataChanged = false;
                    msgEle.innerHTML = 'Load Time: ' + "<b>" + val + "</b>" + '<b>ms</b>';
                    msgEle.classList.remove('e-hide');
                }
            });
        });
        observer.observe(document.getElementById('overviewgrid'), {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }
    const gridFilter = {
        type: 'Menu'
    };
    const status = {
        type: 'CheckBox',
        itemTemplate: statusdetails
    };
    const trust = {
        type: 'CheckBox',
        itemTemplate: trustdetails
    };
    const rating = {
        type: 'CheckBox',
        itemTemplate: ratingDetails
    };
    return (<div className='control-pane'>
      <div className='control-section'>
        <div style={{ paddingBottom: '18px' }}>
          <DropDownListComponent id="games" width='220' dataSource={ddlData} index={0} ref={(dropdownlist) => { ddObj = dropdownlist; }} fields={fields} change={onChange.bind(this)} placeholder="Select a Data Range" popupHeight="240px"/>
          <span id='msg'></span>
          <br />
        </div>
        <GridComponent id="overviewgrid" dataSource={data} loadingIndicator={{ indicatorType: 'Shimmer' }} query={query} enableHover={false} enableVirtualization={true} rowHeight={38} height='400' ref={(g) => { gridInstance = g; }} actionComplete={onComplete.bind(this)} load={onLoad.bind(this)} dataBound={onDataBound.bind(this)} filterSettings={gridFilter} allowFiltering={true} allowSorting={true} allowSelection={true} selectionSettings={select} enableHeaderFocus={true}>
          <ColumnsDirective>
            <ColumnDirective type='checkbox' allowSorting={false} allowFiltering={false} width='60'></ColumnDirective>
            <ColumnDirective field='EmployeeID' visible={false} headerText='Employee ID' isPrimaryKey={true} width='130'></ColumnDirective>
            <ColumnDirective field='Employees' headerText='Employee Name' width='230' clipMode='EllipsisWithTooltip' template={empTemplate}/>
            <ColumnDirective field='Designation' headerText='Designation' width='170' clipMode='EllipsisWithTooltip'/>
            <ColumnDirective field='Mail' headerText='Mail' width='230'></ColumnDirective>
            <ColumnDirective field='Location' headerText='Location' width='140' template={coltemplate}></ColumnDirective>
            <ColumnDirective field='Status' headerText='Status' template={statusTemplate} width='130'></ColumnDirective>
            <ColumnDirective field='Trustworthiness' headerText='Trustworthiness' template={trustTemplate} width='160'></ColumnDirective>
            <ColumnDirective field='Rating' headerText='Rating' template={ratingTemplate} width='220'/>
            <ColumnDirective field='Software' allowFiltering={false} allowSorting={false} headerText='Software Proficiency' width='180' template={progessTemplate} format='C2'/>
            <ColumnDirective field='CurrentSalary' headerText='Current Salary' width='160' format='C2'></ColumnDirective>
            <ColumnDirective field='Address' headerText='Address' width='240' clipMode="EllipsisWithTooltip"></ColumnDirective>
          </ColumnsDirective>
          <Inject services={[Filter, VirtualScroll, Sort]}/>
        </GridComponent>
      </div>
      <style>
        {/* @import 'src/grid/Grid/style.css'; */}
      </style>
    </div>);
}
export default OverView;