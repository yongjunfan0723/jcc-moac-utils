"use strict";

import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import moacABI from "./abi/moacABI";
import Moac from "./moac";
import { isValidAmount, isValidHash, isValidJingtumAddress, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of moac fingate
 *
 * @class Fingate
 * @extends {Moac}
 */
class Fingate extends Moac {

    /**
     * instance of moac contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof Fingate
     */
    private _instance: chain3.mc.contract;

    /**
     * address of moac fingate
     *
     * @private
     * @type {string}
     * @memberof Fingate
     */
    private _address: string;

    /**
     * Creates an instance of Fingate
     * @param {string} node moac node
     * @param {boolean} mainnet main net or test net
     * @memberof Fingate
     */
    constructor(node: string, mainnet: boolean) {
        super(node, mainnet);
        this._instance = null;
        this._address = null;
    }

    /**
     * get _instance
     *
     * @readonly
     * @type {chain3.mc.contract}
     * @memberof Fingate
     */
    public get instance(): chain3.mc.contract {
        return this._instance;
    }

    /**
     * init instance of moac contract
     *
     * @param {string} fingateAddress contract address of moac fingate
     * @memberof Fingate
     */
    @validate
    public initMoacContract(@isValidMoacAddress fingateAddress: string) {
        try {
            super.initChain3();
            if (!super.contractInitialied(this._instance, fingateAddress)) {
                this._address = fingateAddress;
                this._instance = this.contract(moacABI).at(this._address);
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * close chain3 & destroy instance of contract
     *
     * @memberof Fingate
     */
    public close() {
        super.clearChain3();
        this._instance = null;
    }

    /**
     * request deposit state
     *
     * @param {string} address moac address
     * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address of token
     * @returns {(Promise<Array<BigNumber | string>>)}
     * @memberof Fingate
     */
    @validate
    public depositState(@isValidMoacAddress address: string, @isValidMoacAddress contractAddress = "0x0000000000000000000000000000000000000000"): Promise<Array<BigNumber | string>> {
        return new Promise((resolve, reject) => {
            try {
                address = Moac.prefix0x(address);
                const state = this._instance.depositState(contractAddress, address);
                return resolve(state);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * validate deposit state is pending or not
     *
     * @param {(Array<BigNumber | string>)} state
     * @returns {boolean} return true if the state is pending
     * @memberof Fingate
     */
    public isPending(state: Array<BigNumber | string>): boolean {
        return state[0].toString(10) !== "0" || state[1] !== "";
    }

    /**
     * deposit moac
     *
     * @param {string} jtAddress jingtum address
     * @param {number} amount amount of deposit
     * @param {string} moacSecret moac secret
     * @returns {Promise<string>} resolve hash if successful
     * @memberof Fingate
     */
    @validate
    public deposit(@isValidJingtumAddress jtAddress: string, @isValidAmount amount: number, @isValidMoacSecret moacSecret: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const moacAddress = Moac.getAddress(moacSecret);
                const value = new BigNumber(amount).toString(10);
                const gasLimit = this.gasLimit;
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(moacAddress);
                const calldata = this.instance.deposit.getData(jtAddress);
                const rawTx = this.getTx(moacAddress, this.instance.address, nonce, gasLimit, gasPrice, value, calldata);
                const signedTransaction = this._chain3.signTransaction(rawTx, moacSecret);
                const hash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * deposit erc20 token
     *
     * @param {string} jtAddress jingtum address
     * @param {string} tokenAddress erc20 contract address
     * @param {number} decimals token decimals
     * @param {number} amount amount of deposit
     * @param {string} hash generated by `transfer` api of ERC20
     * @param {string} moacSecret moac secret
     * @returns {Promise<string>} reslove hash of transaction if successful
     * @memberof Fingate
     */
    @validate
    public depositToken(@isValidJingtumAddress jtAddress: string, @isValidMoacAddress tokenAddress: string, decimals: number, @isValidAmount amount: number, @isValidHash hash: string, @isValidMoacSecret moacSecret: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const moacAddress = Moac.getAddress(moacSecret);
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const gasLimit = this.gasLimit;
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(moacAddress);
                const calldata = this.instance.depositToken.getData(jtAddress, tokenAddress, value.toString(10), hash);
                const tx = this.getTx(moacAddress, this.instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                const signedTransaction = this._chain3.signTransaction(tx, moacSecret);
                const txHash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(txHash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default Fingate;