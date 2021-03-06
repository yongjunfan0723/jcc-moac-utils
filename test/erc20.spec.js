const chai = require("chai");
const expect = chai.expect;
const ERC20 = require("../lib").ERC20;
const Moac = require("../lib").Moac;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const BigNumber = require("bignumber.js");
const config = require("./config");
describe("test ERC20", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
      expect(inst._address).to.equal(config.MOAC_ERC20_ADDRESS);
    });
  });

  describe("test init ERC20 Contract", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC20();
    });

    afterEach(() => {
      moac.destroyChain3();
      inst.destroy();
    });

    it("instance of erc20 contract had been not initialied", function() {
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.not.deep.equal(instance);
    });

    it("instance of erc20 contract had been initialied", function() {
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
    });

    it("if the address of moac fingate is invalid", function() {
      expect(() => inst.init(config.MOAC_SMART_CONTRACT_ADDRESS.substring(1), moac)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`);
    });

    it("if the address of erc20 contract is invalid", function() {
      expect(() => inst.init(config.MOAC_ERC20_ADDRESS.substring(1), moac)).throw(`${config.MOAC_ERC20_ADDRESS.substring(1)} is invalid moac address.`);
    });

    it("throws error if init error", function() {
      let stub = sandbox.stub(moac, "contract");
      stub.throws(new Error("create moac fingate instance in error"));
      expect(() => inst.init(config.MOAC_ERC20_ADDRESS, moac)).throw("create moac fingate instance in error");
    });
  });

  describe("test close", function() {
    it("close", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
      moac.destroyChain3();
      inst.destroy();
      expect(inst._contract).to.null;
      expect(moac._chain3).to.null;
    });
  });

  describe("ERC20 basic info test", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
      moac.destroyChain3();
      inst.destroy();
    });

    it("Basic infomation", async function() {
      let stub = sandbox.stub(inst._contract, "name");
      stub.returns("JC Coin");
      let name = await inst.name();
      expect(name).to.equal("JC Coin");

      stub = sandbox.stub(inst._contract, "symbol");
      stub.returns("JCC");
      let symbol = await inst.symbol();
      expect(symbol).to.equal("JCC");

      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      let decimals = await inst.decimals();
      expect(decimals).to.equal(18);

      stub = sandbox.stub(inst._contract, "totalSupply");
      stub.returns(1000000000);
      let totalSupply = await inst.totalSupply();
      expect(totalSupply).to.equal(1000000000);
    });
  });

  describe("test balanceOf", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("get balance successfully", async function() {
      const stub = sandbox.stub(moac.getChain3().mc, "call");
      stub.yields(null, "0x00000000000000000000000000000000000000000000000053444835ec580000");
      let s = sandbox.stub(inst._contract, "decimals");
      s.resolves(18);
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      expect(balance).to.equal("6");
      expect(
        stub.calledOnceWith(
          {
            to: "0x9bd4810a407812042f938d2f69f673843301cfa6",
            data: "0x70a082310000000000000000000000000000000000000000000000000000000000000NaN"
          },
          undefined
        )
      );
    });

    it("get balance error", async function() {
      const stub = sandbox.stub(moac.getChain3().mc, "call");
      stub.yields(new Error("test"), null);
      try {
        await inst.balanceOf(config.MOAC_ADDRESS);
      } catch (error) {
        expect(error.message).to.equal("test");
      }
    });
  });

  describe("test transfer", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("transfer successfully", async function() {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(moac, "sendSignedTransaction");
      let hash = await inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.calledOnceWith(config.MOCK_ERC20_TX_SIGN)).to.true;
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("amount is invalid", function() {
      expect(() => inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, -1)).throw(`-1 is invalid amount.`);
    });

    it("moac secret is invalid", function() {
      expect(() => inst.transfer(config.MOAC_SECRET.substring(1), config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE)).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`);
    });

    it("transfer in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      inst.transfer(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });
  });

  describe("test approve/allowance/transferFrom", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC20();
      inst.init(config.MOAC_ERC20_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("approve successfully", async function() {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(moac, "sendSignedTransaction");
      let hash = await inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_APPROVE_HASH);
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("amount is invalid", function() {
      expect(() => inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, -1)).throw(`-1 is invalid amount.`);
    });

    it("moac secret is invalid", function() {
      expect(() => inst.approve(config.MOAC_SECRET.substring(1), config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE)).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`);
    });

    it("approve in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      inst.approve(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });

    it("get allowance", async function() {
      let stub = sandbox.stub(inst._contract, "allowance");
      stub.returns(new BigNumber(config.MOCK_DEPOSIT_VALUE));

      let amount = await inst.allowance(config.MOAC_ADDRESS, config.MOAC_SPENDER_ADDRESS);
      expect(amount.toNumber()).to.equal(config.MOCK_DEPOSIT_VALUE);
    });

    it("transferFrom successfully", async function() {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(moac, "sendSignedTransaction");
      let hash = await inst.transferFrom(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, "0x" + config.MOAC_ADDRESS, config.MOCK_DEPOSIT_VALUE);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_TRANSFERFROM_HASH);
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("transferFrom in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      stub = sandbox.stub(inst._contract, "decimals");
      stub.returns(18);
      inst.transferFrom(config.MOAC_SECRET, config.MOAC_SPENDER_ADDRESS, "0x" + config.MOAC_ADDRESS, config.MOCK_DEPOSIT_VALUE).catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });
  });
});
