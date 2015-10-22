import {getBrowser} from '../mini-testium-mocha';
import assert from 'assertive';

describe('evaluate', () => {
  let browser;
  before(async () => (browser = await getBrowser()));

  before(() => {
    browser.navigateTo('/');
    browser.assert.httpStatus(200);
  });

  it('can get an input\'s value', () => {
    const element = browser.getElement('#text-input');
    const value = element.get('value');
    assert.equal('Input value was not found', 'initialvalue', value);
  });

  it('can clear an input\'s value', () => {
    const element = browser.getElement('#text-input');
    element.clear();
    const value = element.get('value');
    assert.equal('Input value was not cleared', '', value);
  });

  it('can type into an input', () => {
    const element = browser.getElement('#text-input');
    element.type('new stuff');
    const value = element.get('value');
    assert.equal('Input value was not typed', 'new stuff', value);
  });

  it('can replace the input\'s value', () => {
    const element = browser.getElement('#text-input');
    const valueBefore = element.get('value');
    assert.notEqual('Input value is already empty', '', valueBefore);
    browser.clearAndType('#text-input', 'new stuff2');
    const valueAfter = element.get('value');
    assert.equal('Input value was not typed', 'new stuff2', valueAfter);
  });

  it('can get a textarea\'s value', () => {
    const element = browser.getElement('#text-area');
    const value = element.get('value');
    assert.equal('Input value was not found', 'initialvalue', value);
  });

  it('can clear an textarea\'s value', () => {
    const element = browser.getElement('#text-area');
    element.clear();
    const value = element.get('value');
    assert.equal('Input value was not cleared', '', value);
  });

  it('can type into a textarea', () => {
    const element = browser.getElement('#text-area');
    element.type('new stuff');
    const value = element.get('value');
    assert.equal('Input value was not typed', 'new stuff', value);
  });
});
