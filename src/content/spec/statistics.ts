import type { Topic } from "./types";

/**
 * Paper 3, Section A: Statistics.
 *
 * All Pure content is assumed knowledge for Paper 3 and may be tested within
 * these questions, so statistics is never purely statistics.
 */
export const statisticsTopics: Topic[] = [
  {
    number: 1,
    paper: "statistics",
    name: "Statistical sampling",
    slug: "statistical-sampling",
    blurb:
      "One spec point, almost entirely written answers. Cheap marks if you know the vocabulary precisely, and none at all if you are vague.",
    points: [
      {
        code: "1.1",
        title: "Populations, samples and sampling methods",
        phase: "first",
        summary:
          "Understand population and sample, and use samples to make informal inferences; understand simple random, stratified, systematic, quota and opportunity sampling; select or critique a sampling technique in context, recognising that different samples can lead to different conclusions.",
        examNote:
          "Five named methods, and you need an advantage and a disadvantage for each. Answers must be in context — bias is not an answer, but people walking past a gym at 7am are more likely to be fit than the general population is. The census-versus-sample comparison is a standing favourite.",
        keywords: ["population", "sample", "census", "simple random", "stratified", "systematic", "quota", "opportunity", "bias"],
      },
    ],
  },
  {
    number: 2,
    paper: "statistics",
    name: "Data presentation and interpretation",
    slug: "data-presentation",
    blurb:
      "Diagrams, averages, spread, correlation and outliers — and the home of the large data set, which Pearson says gives a material advantage to students who know it.",
    points: [
      {
        code: "2.1",
        title: "Diagrams for single-variable data",
        phase: "spanning",
        summary:
          "Interpret histograms, frequency polygons, box and whisker plots including outliers, and cumulative frequency diagrams, understanding that area in a histogram represents frequency.",
        examNote:
          "Area represents frequency is the whole of histograms. Unequal class widths mean you need frequency density, and the examiner is testing precisely that. Comparing two box plots requires you to mention both an average and a measure of spread, in context.",
        keywords: ["histogram", "frequency density", "box plot", "cumulative frequency", "frequency polygon", "outliers"],
      },
      {
        code: "2.2",
        title: "Scatter diagrams, regression and correlation",
        phase: "first",
        summary:
          "Interpret scatter diagrams and regression lines for bivariate data, using the terms explanatory (independent) and response (dependent) variable, including recognising distinct sections of a population; use interpolation and understand the dangers of extrapolation; interpret correlation informally, and understand that correlation does not imply causation.",
        examNote:
          "Calculating regression lines is explicitly excluded — you interpret them, you do not derive them. Predicting outside the data range is extrapolation and is unreliable; saying so is a mark. The later extension uses logarithms to linearise a power or exponential model, which is spec point 6.6 from Pure reappearing.",
        keywords: ["scatter", "regression", "correlation", "causation", "interpolation", "extrapolation", "bivariate", "explanatory", "response"],
      },
      {
        code: "2.3",
        title: "Central tendency, variation and coding",
        phase: "first",
        summary:
          "Interpret mean, median and mode, and range, interpercentile range, variance and standard deviation, for discrete, continuous, grouped and ungrouped data; use linear interpolation for percentiles from grouped data; calculate standard deviation from summary statistics; understand and use coding.",
        examNote:
          "Coding is the one people fear and it follows one rule: adding a constant shifts the mean but leaves the standard deviation unchanged, while multiplying scales both. Summary statistics questions hand you the sums and expect you to use the Sxx formula rather than the raw data.",
        keywords: ["mean", "median", "mode", "standard deviation", "variance", "coding", "interpolation", "quartiles", "Sxx", "summary statistics"],
      },
      {
        code: "2.4",
        title: "Outliers and cleaning data",
        phase: "first",
        summary:
          "Recognise and interpret possible outliers in data sets and diagrams; select or critique data presentation techniques; clean data, including dealing with missing data, errors and outliers.",
        examNote:
          "The rule for an outlier will always be given in the question — do not import a remembered one. The judgement mark is for deciding whether to remove a value: a genuine extreme observation should usually be kept, a recording error should not.",
        keywords: ["outlier", "cleaning", "missing data", "anomaly", "IQR", "interquartile"],
      },
    ],
  },
  {
    number: 3,
    paper: "statistics",
    name: "Probability",
    slug: "probability",
    blurb:
      "Mutually exclusive and independent events, conditional probability, and critiquing the assumptions a probability model rests on.",
    points: [
      {
        code: "3.1",
        title: "Mutually exclusive and independent events",
        phase: "first",
        summary:
          "Understand and use mutually exclusive and independent events when calculating probabilities, using Venn diagrams, tree diagrams and set notation.",
        examNote:
          "Mutually exclusive and independent are routinely confused and mean opposite things about overlap. Independence is proved by checking whether the probability of both equals the product of the separate probabilities — show that check explicitly when asked.",
        keywords: ["mutually exclusive", "independent", "venn", "tree diagram", "set notation", "union", "intersection"],
      },
      {
        code: "3.2",
        title: "Conditional probability",
        phase: "later",
        summary:
          "Understand and use conditional probability, including tree diagrams, Venn diagrams and two-way tables, and the conditional probability formula and its consequences.",
        examNote:
          "Given that is the signal to restrict your attention to a smaller sample space. The formula is in the booklet, but the marks are for identifying which event is the condition — read the sentence twice before writing anything.",
        keywords: ["conditional", "given that", "tree diagram", "two-way table", "bayes", "formula"],
      },
      {
        code: "3.3",
        title: "Modelling with probability",
        phase: "spanning",
        summary:
          "Model with probability, including critiquing the assumptions made and the likely effect of more realistic assumptions.",
        examNote:
          "Explicit AO3. The spec names questioning whether a die or coin is fair as the archetype. Marks come from naming the assumption and then saying what would change if it failed.",
        keywords: ["modelling", "assumptions", "fair", "critique", "bias"],
      },
    ],
  },
  {
    number: 4,
    paper: "statistics",
    name: "Statistical distributions",
    slug: "statistical-distributions",
    blurb:
      "The binomial and normal distributions as models, and — more importantly — knowing which one a situation calls for and when neither fits.",
    points: [
      {
        code: "4.1",
        title: "Discrete distributions and the binomial",
        phase: "first",
        summary:
          "Understand and use simple discrete probability distributions including the discrete uniform and the binomial as models, and calculate binomial probabilities, using a calculator for individual and cumulative probabilities.",
        examNote:
          "Calculating mean and variance of a general discrete random variable is excluded. You are expected to use the calculator's binomial functions, so learn where they live on his actual model. The examinable judgement is whether the binomial conditions hold: fixed number of trials, two outcomes, constant probability, independence.",
        keywords: ["binomial", "discrete", "uniform", "probability distribution", "cumulative", "calculator", "conditions"],
      },
      {
        code: "4.2",
        title: "The normal distribution",
        phase: "later",
        summary:
          "Understand and use the normal distribution as a model and find probabilities with it; know the shape, symmetry, and that the points of inflection lie one standard deviation either side of the mean; use the normal approximation to the binomial when n is large and p is close to 0.5, with a continuity correction.",
        examNote:
          "Two things carry the marks. First, inverse normal problems where you are given a probability and must find the value, often leading to simultaneous equations for the mean and standard deviation. Second, the continuity correction when approximating a binomial — forgetting the half is the standard error.",
        keywords: ["normal", "gaussian", "inverse normal", "standardise", "continuity correction", "approximation", "points of inflection"],
      },
      {
        code: "4.3",
        title: "Choosing a distribution",
        phase: "later",
        summary:
          "Select an appropriate probability distribution for a context with reasoning, including recognising when the binomial or normal model may not be appropriate.",
        examNote:
          "Pure reasoning marks. Binomial needs a fixed number of independent trials with constant probability; normal needs a continuous, roughly symmetric quantity. Saying why a model does not fit scores as well as saying why one does.",
        keywords: ["choose", "model", "appropriate", "reasoning", "conditions", "critique"],
      },
    ],
  },
  {
    number: 5,
    paper: "statistics",
    name: "Statistical hypothesis testing",
    slug: "hypothesis-testing",
    blurb:
      "The most structured questions on Paper 3 — and because the structure is fixed, the marks are highly predictable once the layout is learnt.",
    points: [
      {
        code: "5.1",
        title: "The language of hypothesis testing",
        phase: "spanning",
        summary:
          "Understand and apply the language of hypothesis testing developed through a binomial model — null and alternative hypotheses, significance level, test statistic, one- and two-tail tests, critical value, critical region, acceptance region and p-value; know informally that a binomial distribution has expected value np, which is what a two-tail test needs in order to pick its tail; extend to correlation coefficients, knowing that r lies between -1 and 1 and that r = +/-1 means the points lie on a straight line, and interpreting a given coefficient against a p-value or critical value.",
        examNote:
          "Calculating a correlation coefficient is excluded — you interpret one the calculator gives you. For correlation tests the hypotheses must be stated in terms of the population correlation coefficient with a null hypothesis of zero. Two-tail tests halve the significance level at each end, which is the most common slip.",
        keywords: ["hypothesis", "null", "alternative", "significance", "critical region", "p-value", "one tail", "two tail", "correlation coefficient"],
      },
      {
        code: "5.2",
        title: "Hypothesis test for a binomial proportion",
        phase: "first",
        summary:
          "Conduct a hypothesis test for the proportion in a binomial distribution and interpret the result in context, understanding that a sample is used to infer about a population and that the significance level is the probability of incorrectly rejecting the null hypothesis.",
        examNote:
          "There is a fixed five-step layout — hypotheses, test statistic, probability or critical region, comparison, conclusion in context — and the final mark is almost always the contextual sentence. Never write accept the null hypothesis; write there is insufficient evidence to reject it. A formal treatment of Type I errors is not required.",
        keywords: ["binomial test", "proportion", "significance", "critical region", "conclusion", "context", "insufficient evidence"],
      },
      {
        code: "5.3",
        title: "Hypothesis test for the mean of a normal distribution",
        phase: "later",
        summary:
          "Conduct a hypothesis test for the mean of a normal distribution with known, given or assumed variance, and interpret the result in context, using the distribution of the sample mean.",
        examNote:
          "The key fact is that the sample mean has the same mean but a variance divided by n — so a sample mean is less variable than a single observation, and forgetting to divide is the classic error. The Central Limit Theorem is explicitly not required.",
        keywords: ["normal test", "sample mean", "variance", "standard error", "z test", "context"],
      },
    ],
  },
];
