import {
  SuggestionCategory,
  SuggestionStatusText,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/packages';

export default {
  fixedNoMatchWithLatestSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.NoMatch,
      name: SuggestionStatusText.NoMatch,
      version: ''
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      category: SuggestionCategory.Updateable,
      name: SuggestionStatusText.UpdateLatest,
      version: '1.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'alpha',
      version: '1.1.0-alpha.1'
    }
  ],
  fixedIsLatestNoSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Latest,
      name: SuggestionStatusText.Latest,
      version: '3.0.0'
    }
  ],
  fixedIsLatestWithPrereleaseSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Latest,
      name: SuggestionStatusText.Latest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  rangeNoMatchWithLatestSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.NoMatch,
      name: SuggestionStatusText.NoMatch,
      version: ''
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      category: SuggestionCategory.Updateable,
      name: SuggestionStatusText.UpdateLatest,
      version: '2.0.0'
    }
  ],
  rangeSatisfiesLatest: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Latest,
      name: SuggestionStatusText.Latest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  latestWithinRange: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Match,
      name: SuggestionStatusText.SatisfiesLatest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      category: SuggestionCategory.Updateable,
      name: SuggestionStatusText.Latest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  rangeSatisfiesUpdateAndSuggestsLatest: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Match,
      name: SuggestionStatusText.Satisfies,
      version: '2.1.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      category: SuggestionCategory.Updateable,
      name: SuggestionStatusText.UpdateRange,
      version: '2.1.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  rangeSatisfiesMaxAndSuggestsLatest: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      category: SuggestionCategory.Match,
      name: SuggestionStatusText.Satisfies,
      version: '2.1.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      category: SuggestionCategory.Updateable,
      name: SuggestionStatusText.UpdateLatest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      category: SuggestionCategory.Updateable,
      name: 'next',
      version: '4.0.0-next'
    }
  ]
}