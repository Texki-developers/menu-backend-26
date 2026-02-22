export enum BranchStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum BranchType {
    MAIN_HQ = 'main_hq',
    STANDARD = 'standard'
}

export enum DayOfWeek {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

export enum City {
    DUBAI = 'Dubai',
    ABU_DHABI = 'Abu Dhabi',
    SHARJAH = 'Sharjah',
    AJMAN = 'Ajman',
    UMM_AL_QUWAIN = 'Umm Al Quwain',
    RAS_AL_KHAIMAH = 'Ras Al Khaimah',
    FUJAIRAH = 'Fujairah'
}

export enum CitySlug {
    DUBAI = 'dubai',
    ABU_DHABI = 'abu-dhabi',
    SHARJAH = 'sharjah',
    AJMAN = 'ajman',
    UMM_AL_QUWAIN = 'umm-al-quwain',
    RAS_AL_KHAIMAH = 'ras-al-khaimah',
    FUJAIRAH = 'fujairah'
}

export const CityToSlugMap: Record<City, CitySlug> = {
    [City.DUBAI]: CitySlug.DUBAI,
    [City.ABU_DHABI]: CitySlug.ABU_DHABI,
    [City.SHARJAH]: CitySlug.SHARJAH,
    [City.AJMAN]: CitySlug.AJMAN,
    [City.UMM_AL_QUWAIN]: CitySlug.UMM_AL_QUWAIN,
    [City.RAS_AL_KHAIMAH]: CitySlug.RAS_AL_KHAIMAH,
    [City.FUJAIRAH]: CitySlug.FUJAIRAH,
};