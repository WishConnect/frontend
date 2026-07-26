export type SelectStatus = 'default' | 'selected';

export const selectContainerStyle: Record<SelectStatus, string> = {
  default: 'bg-[#F9FAFC] border-[#E6E7EB]',
  selected: 'bg-[#F4F4FE] border-[#BDB9F9]',
};

export const selectTextStyle: Record<SelectStatus, string> = {
  default: 'text-[#9DA1AC]',
  selected: 'text-[#320095]',
};
