export const useConfirm = () => {
    return inject<Ref<{ show: Function }>>('confirm')
};