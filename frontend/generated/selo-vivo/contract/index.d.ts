import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  private_issuer_commitment(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  private_credential_class(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  private_expiry_epoch(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  private_biome_group(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  private_holder_secret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  prove_credential(context: __compactRuntime.CircuitContext<PS>,
                   required_class_0: bigint,
                   minimum_expiry_epoch_0: bigint,
                   required_biome_group_0: bigint,
                   request_tag_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  prove_credential(context: __compactRuntime.CircuitContext<PS>,
                   required_class_0: bigint,
                   minimum_expiry_epoch_0: bigint,
                   required_biome_group_0: bigint,
                   request_tag_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  prove_credential(context: __compactRuntime.CircuitContext<PS>,
                   required_class_0: bigint,
                   minimum_expiry_epoch_0: bigint,
                   required_biome_group_0: bigint,
                   request_tag_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly issuer_root: Uint8Array;
  readonly verified_credentials: bigint;
  used_nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly last_disclosed_class: bigint;
  readonly last_request_tag: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               root_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
