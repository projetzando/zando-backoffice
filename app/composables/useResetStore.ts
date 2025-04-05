import { getActivePinia, type Pinia, type Store } from "pinia";

interface ExtendedPinia extends Pinia {
    _s: Map<string, Store>;
}

interface ResetStores {
    [key: string]: () => void;
    all: () => void;
}

export const $ResetPinia = () => {
    const pinia = getActivePinia() as ExtendedPinia;

    if (!pinia) {
        throw new Error("There is no stores");
    }

    const resetStores: ResetStores = {
        all: () => pinia._s.forEach((store) => store.$reset())
    };

    pinia._s.forEach((store, name) => {
        resetStores[name] = () => store.$reset();
    });

    return resetStores;
};