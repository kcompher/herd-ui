/*
* Copyright 2018 herd-ui contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import {browser, by} from 'protractor';
import {DataManager} from './../../../util/DataManager';
import {Operations} from './operations/operations';
import {Data} from './operations/data';
import {DataObjectDetailPage} from './data-object-detail.po';
import {BaseDetail} from './base-detail';

const conf = require('./../../../config/conf.e2e.json');
describe('data-objects detail', () => {

  const baseDetail = new BaseDetail();
  const data = new Data();
  const page = new DataObjectDetailPage();
  const operations = new Operations();

  const dataManager = new DataManager();

  beforeAll(() => {
    dataManager.setUp(operations.postRequests().options);
  });

  afterAll(() => {
    dataManager.tearDown(operations.deleteRequests().options);
  });

  describe('data-objects detail - heading / partition info / details', () => {

    beforeEach(async () => {
      // await dataObjectListUrl(data.versionTestV2);
      await baseDetail.initiateBrowser(data.versionTestV2, null, 1);
    });

    it('static content: BData details page', async () => {
      const bdata = data.versionTestV2;
      const pageTitle = browser.getTitle();
      expect(await pageTitle).toContain(conf.docTitlePrefix + ' - Data Object');

      expect(await page.screenTitle.getText()).toBe('DATA OBJECT');
      expect(await page.keyValueTitle.getText()).toBe(bdata.partitionKey + ': ' + bdata.partitionValue);
      expect(await page.schemaInfoTitle.getText()).toContain('Physical Name');
      expect(await page.schemaInfoTitle.getText()).toContain(bdata.businessObjectDefinitionName);
      expect(await page.schemaInfoTitle.getText()).toContain('Schema');
      expect(await page.schemaInfoTitle.getText()).toContain(
        [bdata.businessObjectFormatUsage, bdata.businessObjectFormatFileType, bdata.businessObjectFormatVersion].join(' :'));

      expect(await page.partitionInfoHeaderLabel.getText()).toBe('Partition Info');
      expect(await page.keyLabel.getText()).toContain('Key');
      expect(await page.valueLabel.getText()).toContain('Value');

      expect(await page.detailsLabels.getText()).toContain('Status');
      expect(await page.detailsLabels.getText()).toContain('Version');
      expect(await page.detailsLabels.getText()).toContain('ID');
    });

    it('partition info: BData details page', async () => {
      expect(await page.partitionValueContainer.getText()).toContain(data.versionTestV2.partitionKey);
      expect(await page.partitionValueContainer.getText()).toContain(data.versionTestV2.partitionValue);

      expect(await page.subPartitionValue.count()).toBe(2);
    });

    it('version info: BData details page', async () => {
      const versionSelector = await page.detailsContainer.element(by.className('version-select'));
      const versionSelectorOptions = versionSelector.all(by.tagName('option'));
      const versionSelectorOptionValues = versionSelectorOptions.getAttribute('ng-reflect-ng-value');
      const versionSelected = versionSelector.getAttribute('ng-reflect-model');
      expect(await page.status.getText()).toBe(data.versionTestV2.status);
      expect(await page.id.getText()).not.toBe('');
      expect(versionSelectorOptionValues).toEqual(['1', '0']);
      expect(versionSelected).toBe('1');
    });


    it('change version: BData details page', async () => {

      // click on the version 1
      const versionSelector = await page.detailsContainer.element(by.className('version-select'));
      versionSelector.$('option[ng-reflect-ng-value="0"]').click();
      expect(await browser.getCurrentUrl()).toContain(baseDetail.replaceUrlParams(data.versionTestV2, null, 1));
    });

    it('partition info: BData details page', async () => {
      await baseDetail.initiateBrowser(data.bdataWithSubpartitions, '|', 0);
      const subParititionKeys = data.formatWithSubpartitionsPerfData.schema.partitions.map(function (partition) {
        return partition.name !== data.bdataWithSubpartitions.partitionKey ? partition.name : ''
      }).slice(1); // take out the empty string due to being actual partitionKey
      // const tt = page.partitions.getText();
      expect(await page.partitionInfoContainer.getText()).toContain(subParititionKeys.toString());
      expect(await page.partitionInfoContainer.getText()).toContain(data.bdataWithSubpartitions.subPartitionValues.toString());
    });

  });

  describe('attributes info: BData details page', () => {

    beforeEach(async () => {
      // await dataObjectListUrl(data.versionTestV2);
      await baseDetail.initiateBrowser(data.versionTestV2, null, 1);
    });

    it('Data attributes values are populated', async () => {
      // Validate that there are two rows
      // expect(await page.userDefAttributesTableRows.count()).toEqual(data.versionTestV2.attributes.length);
      expect(await page.userDefAttributesTableRows.count()).toEqual(3);

      expect(await page.userDefAttributesTableRows.get(0).getText())
        .toEqual('PERFDATASEARCH\nPERFDATA\nDDLDATA : TXT : 0\nPERFKEY999\ntest1|thing2|other3|b4\n1\nDetails');
       //  [data.versionTestV2.attributes[0].name, data.versionTestV2.attributes[0].value].join('\n'));

       // TODO: fix this test so that data-mgmt is not in the bucket name for this file but another file and imported @ani
      // expect(await page.userDefAttributesTableRows.get(1).getText()).toEqual(
      //   'DDLStorage9638\nENABLED\nBucket name:\n{{reinsert here}}\n\nDirectory:\nperfdatasearch/' +
      //   'perfprovider/ddldata/txt/data-lineage-test/schm-v0/data-v2/test-key=perfkey'
      //   // [data.versionTestV2.attributes[1].name, data.versionTestV2.attributes[1].value].join('\n')
      // );
    });

    it('Data attributes registered message displaying correctly when no attributes registered', async () => {
      expect(await page.attributesEmptyMessageLabel.getText()).toBe('No user-defined attributes registered');
    });

  });

});
