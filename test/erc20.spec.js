const chai = require('chai');
const expect = chai.expect;
const ERC20 = require('../lib').ERC20;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test ERC20', function () {

  describe("test constructor", function () {
    it("create successfully", function () {
      let inst = new ERC20(config.MOCK_NODE, true);
      inst.init(config.MOAC_ERC20_ADDRESS);
      expect(inst.gasLimit).to.equal(config.MOCK_GAS_LIMIT);
      inst.gasLimit = config.MOCK_GAS;
      expect(inst.gasLimit).to.equal(config.MOCK_GAS);
      inst = new ERC20(config.MOCK_NODE, false)
      expect(inst._network).to.equal(101);
    })
  })

  describe('test init ERC20 Contract', function () {
    let inst
    before(() => {
      inst = new ERC20(config.MOCK_NODE, true);
    })

    afterEach(() => {
      inst.close();
    });

    it("instance of erc20 contract had been not initialied", function () {
      inst.init(config.MOAC_ERC20_ADDRESS);
      let instance = inst._instance;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst._instance).to.not.null;
      expect(inst._instance).to.not.deep.equal(instance);
    })

    it("instance of erc20 contract had been initialied", function () {
      inst.init(config.MOAC_ERC20_ADDRESS);
      let instance = inst._instance;
      expect(instance).to.not.null;
      inst.init(config.MOAC_ERC20_ADDRESS);
      expect(inst._instance).to.not.null;
      expect(inst._instance).to.deep.equal(instance);
    })

    it("if the address of moac fingate is invalid", function () {
      expect(() => inst.init(config.MOAC_SMART_CONTRACT_ADDRESS.substring(1), config.MOAC_ERC20_ADDRESS)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it("if the address of erc20 contract is invalid", function () {
      expect(() => inst.init(config.MOAC_ERC20_ADDRESS.substring(1))).throw(`${config.MOAC_ERC20_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it('throws error if init error', function () {
      let stub = sandbox.stub(inst, "contract");
      stub.throws(new Error("create moac fingate instance in error"));
      expect(() => inst.init(config.MOAC_ERC20_ADDRESS)).throw("create moac fingate instance in error");
    })
  })

  describe("test close", function () {
    it("close", function () {
      let inst = new ERC20(config.MOCK_NODE, true)
      inst.init(config.MOAC_ERC20_ADDRESS);
      inst.close();
      expect(inst._instance).to.null;
      expect(inst._chain3).to.null;
    })
  })

  describe("ERC20 basic info test", function () {
    let inst;
    before(() => {
      inst = new ERC20(config.MOCK_NODE, true)
      inst.init(config.MOAC_ERC20_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
      inst.close();
    })

    it("Basic infomation", function () {
      let stub = sandbox.stub(inst._instance, "name");
      stub.returns("JC Coin")
      let name = inst.name();
      expect(name).to.equal('JC Coin');

      stub = sandbox.stub(inst._instance, "symbol");
      stub.returns("JCC")
      let symbol = inst.symbol();
      expect(symbol).to.equal('JCC');

      stub = sandbox.stub(inst._instance, "decimals");
      stub.returns(18)
      let decimals = inst.decimals();
      expect(decimals).to.equal(18);
    })
  })

  describe('test balanceOf', function () {
    let inst;
    before(() => {
      inst = new ERC20(config.MOCK_NODE, true)
      inst.init(config.MOAC_ERC20_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('get balance successfully', async function () {
      let stub = sandbox.stub(inst._instance, "balanceOf");
      stub.resolves(new BigNumber(1e19));
      let s = sandbox.stub(inst._instance, "decimals");
      s.returns(18);
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance).to.equal('10.000000000000000000');
    })

    it('get balance in error', async function () {
      let stub = sandbox.stub(inst._instance, "balanceOf");
      stub.rejects(new Error('address is invalid'));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      expect(balance).to.equal('0');
    })
  })

  describe('test transfer', function () {
    let inst;
    before(() => {
      inst = new ERC20(config.MOCK_NODE, true)
      inst.init(config.MOAC_ERC20_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    });

    it('transfer successfully', async function () {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.transfer, "getData");
      stub.returns("0xaa")
      stub = sandbox.stub(inst._instance, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(inst, "sendRawSignedTransaction");
      let hash = await inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_TX_SIGN);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('amount is invalid', function () {
      expect(() => inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, 0)).throw(`0 is invalid amount.`);
    })

    it('moac secret is invalid', function () {
      expect(() => inst.transfer(config.MOAC_SECRET.substring(1), config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE)).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`)
    })

    it('transfer in error', function (done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })
  })

  describe('test approve/allowance/transferFrom', function () {
    let inst;
    before(() => {
      inst = new ERC20(config.MOCK_NODE, true)
      inst.init(config.MOAC_ERC20_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    });

    it('approve successfully', async function () {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.transfer, "getData");
      stub.returns("0xaa")
      stub = sandbox.stub(inst._instance, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(inst, "sendRawSignedTransaction");
      let hash = await inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_APPROVE_HASH);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('amount is invalid', function () {
      expect(() => inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, 0)).throw(`0 is invalid amount.`);
    })

    it('moac secret is invalid', function () {
      expect(() => inst.approve(config.MOAC_SECRET.substring(1), config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE)).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`)
    })

    it('approve in error', function (done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })

    it('get allowance', function () {
      let stub = sandbox.stub(inst._instance, "allowance");
      stub.returns(new BigNumber(config.MOCK_DEPOSIT_VALUE));

      let amount = inst.allowance(config.MOAC_ADDRESS, config.MOAC_SPENDER_ADDRESS);
      expect(amount.toNumber()).to.equal(config.MOCK_DEPOSIT_VALUE)
    })

    it('transferFrom successfully', async function () {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.transferFrom, "getData");
      stub.returns("0xaa")
      stub = sandbox.stub(inst._instance, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(inst, "sendRawSignedTransaction");
      let hash = await inst.transferFrom(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOAC_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_TRANSFERFROM_HASH);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('transferFrom in error', function (done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.transferFrom(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOAC_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })
  })
});