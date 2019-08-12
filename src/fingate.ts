"use strict";

import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import fingateABI from "./abi/fingateABI";
import Moac from "./moac";
import { ITransactionOption } from "./model/transaction";
import { isValidAmount, isValidHash, isValidJingtumAddress, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of moac fingate
 *
 * @class Fingate
 */
class Fingate {

    /**
     * instance of moac contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof Fingate
     */
    private _contract: chain3.mc.contract;

    /**
     * instance of moac
     *
     * @private
     * @type {Moac}
     * @memberof Fingate
     */
    private _moac: Moac;

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
     * @memberof Fingate
     */
    constructor() {
        this._contract = null;
        this._address = null;
        this._moac = null;
    }

    /**
     * get _contract
     *
     * @readonly
     * @type {chain3.mc.contract}
     * @memberof Fingate
     */
    public get instance(): chain3.mc.contract {
        return this._contract;
    }

    /**
     * init instance of moac contract
     *
     * @param {string} fingateAddress contract address of moac fingate
     * @param {Moac} moac instance
     * @memberof Fingate
     */
    @validate
    public init(@isValidMoacAddress fingateAddress: string, moac: Moac) {
        try {
            if (!moac.contractInitialied(this._contract, fingateAddress)) {
                this._address = fingateAddress;
                this._moac = moac;
                this._contract = this._moac.contract(fingateABI).at(this._address);
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
    public destroy() {
        this._contract = null;
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
                const state = this._contract.depositState(contractAddress, address);
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
     * @param {string} amount amount of deposit
     * @param {string} moacSecret moac secret
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof Fingate
     */
    @validate
    public deposit(@isValidJingtumAddress jtAddress: string, @isValidAmount amount: string, @isValidMoacSecret moacSecret: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const moacAddress = Moac.getAddress(moacSecret);
                const value = new BigNumber(amount).toString(10);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(moacAddress);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this.instance.deposit.getData(jtAddress);
                const rawTx = this._moac.getTx(moacAddress, this.instance.address, options.nonce, options.gasLimit, options.gasPrice, value, calldata);
                const signedTransaction = this._moac.signTransaction(rawTx, moacSecret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
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
     * @param {string} amount amount of deposit
     * @param {string} hash generated by `transfer` api of ERC20
     * @param {string} moacSecret moac secret
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} reslove hash of transaction if successful
     * @memberof Fingate
     */
    @validate
    public depositToken(@isValidJingtumAddress jtAddress: string, @isValidMoacAddress tokenAddress: string, decimals: number, @isValidAmount amount: string, @isValidHash hash: string, @isValidMoacSecret moacSecret: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const moacAddress = Moac.getAddress(moacSecret);
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(moacAddress);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this.instance.depositToken.getData(jtAddress, tokenAddress, value.toString(10), hash);
                const tx = this._moac.getTx(moacAddress, this.instance.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, moacSecret);
                const txHash = await this._moac.sendRawSignedTransaction(signedTransaction);
                return resolve(txHash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default Fingate;
