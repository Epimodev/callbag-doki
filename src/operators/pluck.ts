import { Operator } from '../index';
import map from './map';

function plucker(properties: string[]) {
  const nbProperties = properties.length;

  return (value: any) => {
    let currentValue = value;

    for (let i = 0; i < nbProperties; i += 1) {
      currentValue = currentValue[properties[i]];
    }

    return currentValue;
  };
}

/**
 * Maps each source value (an object) to its specified nested property
 *
 * @param properties - nested properties to pluck from each source value
 * @return callbag operator
 *
 * @public
 */
function pluck<T, K1 extends keyof T>(k1: K1): Operator<T, T[K1]>;
function pluck<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  k1: K1,
  k2: K2,
): Operator<T, T[K1][K2]>;
function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
  k1: K1,
  k2: K2,
  k3: K3,
): Operator<T, T[K1][K2][K3]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(k1: K1, k2: K2, k3: K3, k4: K4): Operator<T, T[K1][K2][K3][K4]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4]
>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): Operator<T, T[K1][K2][K3][K4][K5]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5]
>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): Operator<T, T[K1][K2][K3][K4][K5][K6]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5],
  K7 extends keyof T[K1][K2][K3][K4][K5][K6]
>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5,
  k6: K6,
  k7: K7,
): Operator<T, T[K1][K2][K3][K4][K5][K6][K7]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5],
  K7 extends keyof T[K1][K2][K3][K4][K5][K6],
  K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7]
>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5,
  k6: K6,
  k7: K7,
  k8: K8,
): Operator<T, T[K1][K2][K3][K4][K5][K6][K7][K8]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5],
  K7 extends keyof T[K1][K2][K3][K4][K5][K6],
  K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
  K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8]
>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5,
  k6: K6,
  k7: K7,
  k8: K8,
  k9: K9,
): Operator<T, T[K1][K2][K3][K4][K5][K6][K7][K8][K9]>;
function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5],
  K7 extends keyof T[K1][K2][K3][K4][K5][K6],
  K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
  K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8],
  K10 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8][K9]
>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5,
  k6: K6,
  k7: K7,
  k8: K8,
  k9: K9,
  k10: K10,
): Operator<T, T[K1][K2][K3][K4][K5][K6][K7][K8][K9][K10]>;
function pluck<I, O = unknown>(...properties: string[]): Operator<I, O> {
  return map(plucker(properties));
}

export default pluck;
