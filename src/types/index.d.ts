import BN from 'bn.js'

export type BigNumber = BN

export type Account = string
export type Balance = string | number | BigNumber

export interface AppStore {
    state: State;
    appLoading: (loadingState: boolean) => void;
    registerProviders: (provider: WalletProvider) => void;
    saveContract: (contract: DeployedContract) => void;
    setActiveProvider: (providerName: string) => void;
    setUserState: () => Promise<void>;
    showModal: (message: string) => void;
}

export interface State {
    USER: {
        ACCOUNT: Account | 'CONNECTION ERROR',
        BALANCE: Balance,
    },
    PROVIDER: {
        ACTIVE_PROVIDER: string,
        PROVIDERS: WalletProvider[],
        NETWORK: ETHEREUM_NETWORKS | 'NETWORK NOT SUPPORTED',
        BLOCK_TIMESTAMP: undefined,
    },
    CONTRACTS: {
        [contractName: string]: DeployedContract,
    },
    SHOW_MODAL: string,
    LOADING: boolean,
}

export type SubscriptionStateInterface = [
    { account: Account },
    { timestamp: string },
    { balance: Balance },
    { network: ETHEREUM_NETWORKS },
]

export enum ETHEREUM_NETWORKS {
    MAIN = 'MAIN',
    RINKEBY = 'RINKEBY',
    KOVAN = 'KOVAN',
    MORDEN = 'MORDEN',
    ROPSTEN = 'ROPSTEN',
    UNKNOWN = 'UNKNOWN',
}

export interface Network2URL {
    RINKEBY: 'https://rinkeby.etherscan.io/',
    KOVAN: 'https://kovan.etherscan.io/',
    MAIN: 'https://etherscan.io/',
    UNKNOWN: '//localhost:5000/',
}

export interface Code2Name {
    ETH: 'ETHER',
    WETH: 'WRAPPED ETHER',
    GNO: 'GNOSIS',
    REP: 'AUGUR',
    '1ST': 'FIRST BLOOD',
    OMG: 'OMISEGO',
    GNT: 'GOLEM',
    KNC: 'KYBER',
    MGN: 'MAGNOLIA',
    OWL: 'OWL',
    RDN: 'RAIDEN',
    GEN: 'DAOSTACK',
    DAI: 'DAI',
    MKR: 'MAKER',
}

//////////////////////////////
// TOKENS
//////////////////////////////

export type TokenCode = keyof Code2Name
export type TokenName = Code2Name[TokenCode]
export type TokenAddresses = Account[]

export interface DefaultTokens {
    elements: DefaultTokenList;
    page: number,
    hasMorePages: boolean;
    version: number;
}
export interface DefaultTokenObject {
    name: TokenName;
    symbol: TokenCode;
    address: Account;
    decimals: number;
    isETH?: boolean;
}
export type DefaultTokenList = DefaultTokenObject[]

type TokensInterfaceExtended = {
    [K in keyof TokensInterface]: TokensInterface[K] extends (...args: any[]) => Promise<Receipt> ?
    TokensInterface[K] & { estimateGas?: (mainParams?: any, txParams?: TransactionObject) => any, sendTransaction?: TokensInterface<Hash>[K] } :
    TokensInterface[K]
}

export { TokensInterfaceExtended as TokensInterface }

interface TokensInterface<T = Receipt> {
    getToken(tokenAddress: Account): Promise<FullERC20Interface> | Error,
    getTokenDecimals?(tokenAddress: Account): Promise<BigNumber>,
    getTokenBalance(tokenAddress: Account, account: Account): Promise<BigNumber>,
    getTotalSupply(tokenAddress: Account): Promise<BigNumber>,
    transfer(tokenAddress: Account, to: Account, value: Balance, tx: TransactionObject): Promise<T>,
    transferFrom(
        tokenAddress: Account,
        from: Account,
        to: Account,
        value: Balance,
        tx: TransactionObject,
    ): Promise<T>,
    approve(tokenAddress: Account, spender: Account, value: Balance, tx: TransactionObject): Promise<T>,
    allowance(tokenAddress: Account, owner: Account, spender: Account): Promise<BigNumber>,

    ethTokenBalance?(account: Account): Promise<BigNumber>,
    depositETH?(tokenAddress: Account, tx: TransactionObject & { value?: TransactionObject['value'] }): Promise<T>,
    withdrawETH?(value: Balance, tx: TransactionObject): Promise<T>,
}

export interface ERC20Interface extends DeployedContract {
    totalSupply(): Promise<BigNumber>,
    balanceOf(account: Account): Promise<BigNumber>,
    transfer(to: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
    transferFrom(from: Account, to: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
    approve(spender: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
    allowance(owner: Account, spender: Account): Promise<BigNumber>,
    Transfer: ContractEvent
    Approval: ContractEvent,
    allEvents(filter?: Filter, cb?: ErrorFirstCallback): void,
    allEvents(filter?: Filter): EventInstance,
}

export interface SimpleERC20Interface {
    transfer(to: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
    transferFrom(from: Account, to: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
    approve(spender: Account, value: Balance, tx: TransactionObject): Promise<Receipt>,
}

export interface FullERC20Interface extends SimpleERC20Interface {
    symbol: {
        call(): Promise<string>,
    },
    name: {
        call(): Promise<string>,
    },
    decimals: {
        call(): Promise<BigNumber>,
    },
    allowance: {
        call(owner: Account, spender: Account): Promise<BigNumber>,
    },
    totalSupply: {
        call(): Promise<BigNumber>,
    },
    balanceOf: {
        call(account: Account): Promise<BigNumber>,
    },
}

export interface GNOInterface extends ERC20Interface {
    symbol(): Promise<'GNO'>,
    name(): Promise<'Gnosis'>,
    decimals(): Promise<BigNumber>,
}

type ETHInterfaceExtended = {
    [K in keyof ETHInterface]: ETHInterface[K] extends (...args: any[]) => Promise<Receipt> ?
    ETHInterface[K] & { estimateGas?: (mainParams?: any, txParams?: TransactionObject) => any, sendTransaction?: ETHInterface<Hash>[K] } :
    ETHInterface[K]
}

export { ETHInterfaceExtended as ETHInterface }

interface ETHInterface<T = Receipt> extends ERC20Interface {
    symbol(): Promise<'ETH'>,
    name(): Promise<'Ether Token'>,
    decimals(): Promise<BigNumber>,

    deposit(tx: TransactionObject & { value?: TransactionObject['value'] }): Promise<T>,
    withdraw(value: Balance, tx: TransactionObject): Promise<T>,
    Deposit: ContractEvent,
    Withdrawal: ContractEvent,
}

export interface OWLInterface extends ERC20Interface {
    symbol(): Promise<'OWL'>,
    name(): Promise<'OWL Token'>,
    decimals(): Promise<BigNumber>,
    creator(): Promise<Account>,
    minter(): Promise<Account>,
    masterCopyCountdownType(): never,

    startMasterCopyCountdown(_masterCopy: Account, tx: TransactionObject): Promise<Receipt>,
    updateMasterCopy(tx: TransactionObject): Promise<Receipt>,
    setMinter(newMinter: Account, tx: TransactionObject): Promise<Receipt>,
    mintOWL(to: Account, amount: Balance, tx: TransactionObject): Promise<Receipt>,
    burnOWL(amount: Balance, tx: TransactionObject): Promise<Receipt>,
    getMasterCopy(): Promise<Account>
    Minted: ContractEvent,
    Burnt: ContractEvent,
}

export interface MGNInterface extends ERC20Interface {
    owner(): Promise<Account>,
    minter(): Promise<Account>,
    symbol(): Promise<'MGN'>,
    name(): Promise<'Magnolia Token'>,
    decimals(): Promise<BigNumber>,
    /**
     * @returns Promise<[amountUnlocked, withdrawalTime]>
     */
    unlockedTokens(account: Account): Promise<[BigNumber, BigNumber]>,
    lockedTokenBalances(account: Account): Promise<BigNumber>,

    updateOwner(_owner: Account, tx: TransactionObject): Promise<Receipt>,
    updateMinter(_minter: Account, tx: TransactionObject): Promise<Receipt>,
    mintTokens(user: Account, amount: Balance, tx: TransactionObject): Promise<Receipt>,
    lockTokens(amount: Balance, tx: TransactionObject): Promise<Receipt>,
    unlockTokens(amount: Balance, tx: TransactionObject): Promise<Receipt>,
    withdrawUnlockedTokens(tx: TransactionObject): Promise<Receipt>,
}

//////////////////////////////
// PROVIDERS
//////////////////////////////

export enum WalletProviderEnum {
    METAMASK = 'METAMASK',
    PARITY = 'PARITY',
    REMOTE = 'REMOTE',
    LEDGER = 'LEDGER',
    WALLETCONNECT = 'WALLETCONNECT'
}

export interface ProviderState {
    account: Account,
    network: ETHEREUM_NETWORKS,
    balance: Balance,
    available: boolean,
    unlocked: boolean,
    timestamp?: number,
}

export enum ProviderType { INJECTED_WALLET = 'INJECTED_WALLET', HARDWARE_WALLET = 'HARDWARE_WALLET' }
export enum ProviderName {
    COINBASE = 'COINBASE',
    METAMASK = 'METAMASK',
    MIST = 'MIST',
    STATUS = 'STATUS',
    'GNOSIS SAFE' = 'GNOSIS SAFE',

    LEDGER = 'LEDGER',
    INJECTED_WALLET = 'INJECTED_WALLET',
}

export interface WalletProvider {
    keyName: ProviderName | ProviderType,
    providerName: WalletProviderEnum,
    providerType: 'HARDWARE_WALLET' | 'INJECTED_WALLET',
    // controls which provider is considered default
    priority: number,
    // internal flag determining if rovider was even injected
    walletAvailable?: boolean,
    // called first in initialization
    checkAvailability(): boolean,
    // creates ocal web3 instance
    initialize(): void,
    state?: ProviderState,
    web3?: any,
}

/* Colours */
export type PreColours = 'gray' | 'pink' | 'yellow' | 'violet' | 'green' | 'blue' | 'purple' | 'salmon' | 'lightSalmon' | 'greenGradient' | 'info'

/* CONTRACTS */
export type Index = number | BigNumber

export type Hash = string
export interface BlockReceipt {
    number: number | null, // - the block number. null when its pending block.
    hash: string | null, // - hash of the block. null when its pending block.
    parentHash: string,  // - hash of the parent block.
    nonce: string | null, // - hash of the generated proof-of-work. null when its pending block.
    sha3Uncles: string, // - SHA3 of the uncles data in the block.
    logsBloom: string, // - the bloom filter for the logs of the block. null when its pending block.
    transactionsRoot: string, // - the root of the transaction trie of the block
    stateRoot: string, // - the root of the final state trie of the block.
    miner: string, // - the address of the beneficiary to whom the mining rewards were given.
    difficulty: BigNumber, // - integer of the difficulty for this block.
    totalDifficulty: BigNumber, // - integer of the total difficulty of the chain until this block.
    extraData: string, // - the "extra data" field of this block.
    size: number, // - integer the size of this block in bytes.
    gasLimit: number, // - the maximum gas allowed in this block.
    gasUsed: number, // - the total used gas by all transactions in this block.
    timestamp: number, // - the unix timestamp for when the block was collated.
    transactions: TransactionObject[] | Hash[], // - Array of transaction objects, or 32 Bytes transaction hashes
    uncles: Hash[], // - Array of uncle hashes.
}

export interface Settings {
    disclaimer_accepted: boolean;
    networks_accepted: {
        [networkName: string]: boolean;
    }
}

export interface CookieSettings {
    analytics: boolean;
    cookies: boolean;
}

export interface Web3AppAPI {
    getCurrentAccount(): Promise<Account>,
    getAccounts?(): Promise<Account[]>,
    getBlockInfo(bl: 'earliest' | 'latest' | 'pending' | Hash, returnTransactionObjects?: boolean): Promise<BlockReceipt>,
    getTransaction?(tx: Hash): Promise<TransactionObject | null>,
    getTransactionReceipt?(tx: Hash): Promise<TransactionReceipt | null>,
    getETHBalance?(account: Account, inETH?: boolean): Promise<BigNumber>,
    getCurrentBalance(): Promise<BN>,
    getNetwork?(): Promise<"Mainnet" | "Morden" | "Ropsten" | "Rinkeby" | "Kovan" | "No network detected" | "Local Network">,
    getNetworkId(): Promise<number>,
    isConnected?(): boolean,
    isAddress?(address: Account): boolean,
    currentProvider: string,
    web3: any,
    setProvider?(provider: any): void,
    resetProvider?(): void,
    getTimestamp?(block?: number | string): Promise<number>,
    web3WS: any,
}

export interface TransactionObject {
    hash?: string,
    from: Account,
    to?: Account,
    value?: Balance | number,
    gas?: Balance | number,
    gasPrice?: Balance | number,
    data?: string,
    nonce?: string | number,
}

export type Web3EventLog = { _eventName: string } & { [T: string]: string | BigNumber }

export interface TransactionLog {
    logIndex: number,
    transactionIndex: number,
    transactionHash: string,
    blockHash: string,
    blockNumber: number,
    address: Account,
    data: string,
    topics: (string | null)[],
    type: 'mined' | 'pending',
}

export interface TransactionReceipt {
    transactionHash: string,
    transactionIndex: number,
    blockHash: string,
    blockNumber: number,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: null | Account,
    logs: TransactionLog[],
    status: '0x1' | '0x0',
    logsBloom: string,
}

export interface ErrorFirstCallback {
    (err: Error, result: any): void
}

export interface ContractEvent {
    (valueFilter: object | void, filter: Filter): EventInstance,
    (valueFilter: object | void, filter: Filter, cb: ErrorFirstCallback): void,
}

export interface EventInstance {
    watch(cb: ErrorFirstCallback): EventInstance,
    stopWatching(): void,
    get(cb: ErrorFirstCallback): void,
}

interface FilterObject {
    fromBlock?: number | 'latest' | 'pending',
    toBlock?: number | 'latest' | 'pending',
    address?: Account,
    topics?: (string | null)[],
}

export type Filter = 'latest' | 'pending' | FilterObject | void

export type ABI = {
    anonymous?: boolean,
    constant?: boolean,
    inputs: { name: string, type: string }[],
    name: string,
    outputs?: { name: string, type: string }[],
    payable?: boolean,
    stateMutability?: string,
    type: string,
}[]

export interface ContractArtifact {
    contractName: string,
    abi: ABI,
    bytecode: string,
    deployedBytecode: string,
    sourceMap: string,
    deployedSourceMap: string,
    source: string,
    sourcePath: string,
    ast: object,
    legacyAst: object,
    compiler: {
        name: string,
        version: string,
    },
    networks: {
        [P: number]: {
            events: object,
            links: object,
            address: Account,
            transactionHash: string,
        },
    }
}
export interface SimpleContract {
    address: Account | void,
    contractName: string,
    at<T = SimpleContract>(address: Account): T,
    setProvider(provider: any): void,
    deployed<T = DeployedContract>(): Promise<T>,
    abi?: ABI,
}
export interface DeployedContract {
    abi: ABI,
    address: Account,
}

export interface Receipt {
    [key: string]: any,
    tx: string,
    receipt: {
        transactionHash: string,
        transactionIndex: number,
        blockHash: string,
        blockNumber: number,
        gassed: number,
        cumulativeGasUsed: number,
        contractAddress: null | Account,
        logs: { [key: string]: any }[]
        status: number,
    }
    logs: { [key: string]: any }[],
}
