'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of SSPList';
const expectedTitle = `${expectedH1}`;
const targetSSP = { id: 15, name: 'Magneta' };
const targetSSPDashboardIndex = 3;
const nameSuffix = 'X';
const newSSPName = targetSSP.name + nameSuffix;

class Ssp {
  id: number;
  name: string;

  // Factory methods

  // Ssp from string formatted as '<id> <name>'.
  static fromString(s: string): Ssp {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // Ssp from ssp list <li> element.
  static async fromLi(li: ElementFinder): Promise<Ssp> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], name: strings[1] };
  }

  // Ssp id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Ssp> {
    // Get ssp id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    let _name = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        name: _name.substr(0, _name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topSSPList: element.all(by.css('app-root app-dashboard > div h4')),

      appSSPListHref: navElts.get(1),
      appSSPList: element(by.css('app-root app-sspList')),
      allSSPList: element.all(by.css('app-root app-sspList li')),
      selectedSSPSubview: element(by.css('app-root app-sspList > div:last-child')),

      heroDetail: element(by.css('app-root app-ssp-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'SSPList'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top sspList', () => {
      let page = getPageElts();
      expect(page.topSSPList.count()).toEqual(4);
    });

    it(`selects and routes to ${targetSSP.name} details`, dashboardSelectTargetSSP);

    it(`updates ssp name (${newSSPName}) in details view`, updateSSPNameInDetailView);

    it(`cancels and shows ${targetSSP.name} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetSSPElt = getPageElts().topSSPList.get(targetSSPDashboardIndex);
      expect(targetSSPElt.getText()).toEqual(targetSSP.name);
    });

    it(`selects and routes to ${targetSSP.name} details`, dashboardSelectTargetSSP);

    it(`updates ssp name (${newSSPName}) in details view`, updateSSPNameInDetailView);

    it(`saves and shows ${newSSPName} in Dashboard`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetSSPElt = getPageElts().topSSPList.get(targetSSPDashboardIndex);
      expect(targetSSPElt.getText()).toEqual(newSSPName);
    });

  });

  describe('SSPList tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to SSPList view', () => {
      getPageElts().appSSPListHref.click();
      let page = getPageElts();
      expect(page.appSSPList.isPresent()).toBeTruthy();
      expect(page.allSSPList.count()).toEqual(10, 'number of sspList');
    });

    it('can route to ssp details', async () => {
      getSSPLiEltById(targetSSP.id).click();

      let page = getPageElts();
      expect(page.heroDetail.isPresent()).toBeTruthy('shows ssp detail');
      let ssp = await Ssp.fromDetail(page.heroDetail);
      expect(ssp.id).toEqual(targetSSP.id);
      expect(ssp.name).toEqual(targetSSP.name.toUpperCase());
    });

    it(`updates ssp name (${newSSPName}) in details view`, updateSSPNameInDetailView);

    it(`shows ${newSSPName} in SSPList list`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular();
      let expectedText = `${targetSSP.id} ${newSSPName}`;
      expect(getSSPAEltById(targetSSP.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newSSPName} from SSPList list`, async () => {
      const heroesBefore = await toSSPArray(getPageElts().allSSPList);
      const li = getSSPLiEltById(targetSSP.id);
      li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(page.appSSPList.isPresent()).toBeTruthy();
      expect(page.allSSPList.count()).toEqual(9, 'number of sspList');
      const heroesAfter = await toSSPArray(page.allSSPList);
      // console.log(await Ssp.fromLi(page.allSSPList[0]));
      const expectedSSPList =  heroesBefore.filter(h => h.name !== newSSPName);
      expect(heroesAfter).toEqual(expectedSSPList);
      // expect(page.selectedSSPSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetSSP.name}`, async () => {
      const newSSPName = 'Alice';
      const heroesBefore = await toSSPArray(getPageElts().allSSPList);
      const numSSPList = heroesBefore.length;

      element(by.css('input')).sendKeys(newSSPName);
      element(by.buttonText('add')).click();

      let page = getPageElts();
      let heroesAfter = await toSSPArray(page.allSSPList);
      expect(heroesAfter.length).toEqual(numSSPList + 1, 'number of sspList');

      expect(heroesAfter.slice(0, numSSPList)).toEqual(heroesBefore, 'Old sspList are still there');

      const maxId = heroesBefore[heroesBefore.length - 1].id;
      expect(heroesAfter[numSSPList]).toEqual({id: maxId + 1, name: newSSPName});
    });

    it('displays correctly styled buttons', async () => {
      element.all(by.buttonText('x')).then(buttons => {
        for (const button of buttons) {
          // Inherited styles from styles.css
          expect(button.getCssValue('font-family')).toBe('Arial');
          expect(button.getCssValue('border')).toContain('none');
          expect(button.getCssValue('padding')).toBe('5px 10px');
          expect(button.getCssValue('border-radius')).toBe('4px');
          // Styles defined in sspList.component.css
          expect(button.getCssValue('left')).toBe('194px');
          expect(button.getCssValue('top')).toBe('-32px');
        }
      });

      const addButton = element(by.buttonText('add'));
      // Inherited styles from styles.css
      expect(addButton.getCssValue('font-family')).toBe('Arial');
      expect(addButton.getCssValue('border')).toContain('none');
      expect(addButton.getCssValue('padding')).toBe('5px 10px');
      expect(addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive ssp search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys('Ma');
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys('g');
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetSSP.name}`, async () => {
      getPageElts().searchBox.sendKeys('n');
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let ssp = page.searchResults.get(0);
      expect(ssp.getText()).toEqual(targetSSP.name);
    });

    it(`navigates to ${targetSSP.name} details view`, async () => {
      let ssp = getPageElts().searchResults.get(0);
      expect(ssp.getText()).toEqual(targetSSP.name);
      ssp.click();

      let page = getPageElts();
      expect(page.heroDetail.isPresent()).toBeTruthy('shows ssp detail');
      let hero2 = await Ssp.fromDetail(page.heroDetail);
      expect(hero2.id).toEqual(targetSSP.id);
      expect(hero2.name).toEqual(targetSSP.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetSSP() {
    let targetSSPElt = getPageElts().topSSPList.get(targetSSPDashboardIndex);
    expect(targetSSPElt.getText()).toEqual(targetSSP.name);
    targetSSPElt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.heroDetail.isPresent()).toBeTruthy('shows ssp detail');
    let ssp = await Ssp.fromDetail(page.heroDetail);
    expect(ssp.id).toEqual(targetSSP.id);
    expect(ssp.name).toEqual(targetSSP.name.toUpperCase());
  }

  async function updateSSPNameInDetailView() {
    // Assumes that the current view is the ssp details view.
    addToSSPName(nameSuffix);

    let page = getPageElts();
    let ssp = await Ssp.fromDetail(page.heroDetail);
    expect(ssp.id).toEqual(targetSSP.id);
    expect(ssp.name).toEqual(newSSPName.toUpperCase());
  }

});

function addToSSPName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getSSPAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getSSPLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toSSPArray(allSSPList: ElementArrayFinder): Promise<Ssp[]> {
  let promisedSSPList = await allSSPList.map(Ssp.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedSSPList);
}
