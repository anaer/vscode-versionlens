import { SuggestionStatus, SuggestionTypes, TPackageSuggestion } from "domain/suggestions";

export default {
  fixedNoMatchWithLatestSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.NoMatch,
      version: ''
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      name: SuggestionStatus.Latest,
      version: '1.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      name: 'alpha',
      version: '1.1.0-alpha.1'
    }
  ],
  fixedIsLatestNoSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.Latest,
      version: '3.0.0'
    }
  ],
  fixedIsLatestWithPrereleaseSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.Latest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  rangeNoMatchWithLatestSuggestions: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.NoMatch,
      version: ''
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      name: SuggestionStatus.Latest,
      version: '2.0.0'
    }
  ],
  rangeSatisfiesLatestOnly: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.SatisfiesLatest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      name: 'next',
      version: '4.0.0-next'
    }
  ],
  rangeSatisfiesAndSuggestsLatest: [
    <TPackageSuggestion>{
      type: SuggestionTypes.status,
      name: SuggestionStatus.Satisfies,
      version: '2.1.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.release,
      name: SuggestionStatus.Latest,
      version: '3.0.0'
    },
    <TPackageSuggestion>{
      type: SuggestionTypes.prerelease,
      name: 'next',
      version: '4.0.0-next'
    }
  ]
}