window.PREDEFINED_NODES = [
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": {
      "fastq": "/work/input/fq"
    },
    "output_dir": "/work/output/00_ReadQC/QC_Report_Before_Trimming",
    "params": {
      "fastqc_path": "fastqc",
      "threads": 4,
      "flag": 0,
      "file_pattern": "*.fastq*"
    }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": {
      "input": "/work/output/00_ReadQC/QC_Report_Before_Trimming"
    },
    "output_dir": "/work/output/00_ReadQC/QC_Report_Before_Trimming",
    "dependencies": [
      1
    ],
    "params": {
      "multiqc_path": "multiqc"
    }
  },
  {
    "tool": "trim_galore",
    "subcommand": "trim_galore",
    "input_dir": {
      "fastq": "/work/input/fq"
    },
    "output_dir": "/work/output/00_ReadQC/TrimmedData",
    "params": {
      "trim_galore_path": "trim_galore",
      "cores": 4,
      "additional_params": "",
      "paired_pattern": "*_1.*"
    }
  },
  {
    "tool": "fastqc",
    "subcommand": "fastqc",
    "input_dir": {
      "trimmed_data": "/work/output/00_ReadQC/TrimmedData"
    },
    "output_dir": "/work/output/00_ReadQC/QC_Report_After_Trimming",
    "dependencies": [
      3
    ],
    "params": {
      "fastqc_path": "fastqc",
      "threads": 8,
      "flag": 1,
      "file_pattern": "*_val_*.fq.gz"
    }
  },
  {
    "tool": "multiqc",
    "subcommand": "multiqc",
    "input_dir": {
      "input": "/work/output/00_ReadQC/QC_Report_After_Trimming"
    },
    "output_dir": "/work/output/00_ReadQC/QC_Report_After_Trimming",
    "parallelize": true,
    "dependencies": [
      4
    ],
    "params": {
      "multiqc_path": "multiqc"
    }
  },
  {
    "tool": "bwa",
    "subcommand": "index",
    "input_dir": {
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/output/01_ReadMapping/01_Indexing",
    "dependencies": [
      5
    ],
    "params": {
      "bwa_path": "bwa",
      "threads": 20,
      "reference": "/work/input/ref/cow.chr1.fa",
      "prefix": "ref"
    }
  },
  {
    "tool": "bwa",
    "subcommand": "mem",
    "input_dir": {
      "base": "/work/output/00_ReadQC/TrimmedData"
    },
    "output_dir": "/work/output/01_ReadMapping/02_Mapping",
    "parallelize": true,
    "dependencies": [
      6
    ],
    "params": {
      "bwa_path": "bwa",
      "threads": 4,
      "index_prefix": "/work/output/01_ReadMapping/01_Indexing/ref",
      "platform": "ILLUMINA",
      "breeds": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "samples": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    }
  },
  {
    "tool": "samtools",
    "subcommand": "sort",
    "input_dir": {
      "input_sam": "/work/output/01_ReadMapping/02_Mapping"
    },
    "output_dir": "/work/output/01_ReadMapping/02_Mapping",
    "parallelize": true,
    "dependencies": [
      7
    ],
    "params": {
      "samtools_path": "samtools",
      "threads": 4,
      "breeds": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "samples": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    }
  },
  {
    "tool": "picard",
    "subcommand": "mark_duplicates",
    "input_dir": {
      "input_bam": "/work/output/01_ReadMapping/02_Mapping"
    },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    "parallelize": true,
    "dependencies": [
      8
    ],
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "memory": 4,
      "breeds": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "samples": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    }
  },
  {
    "tool": "picard",
    "subcommand": "add_read_groups",
    "input_dir": {
      "input_bam": "/work/output/01_ReadMapping/03_Dedup"
    },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    "parallelize": true,
    "dependencies": [
      9
    ],
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "memory": 4,
      "platform": "ILLUMINA",
      "platform_unit": "UNIT1",
      "breeds": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "samples": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    }
  },
  {
    "tool": "samtools",
    "subcommand": "faidx",
    "input_dir": {
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/input/ref",
    "dependencies": [
      10
    ],
    "params": {
      "tool_path": "samtools",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "picard",
    "subcommand": "create_sequence_dictionary",
    "input_dir": {
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/input/ref",
    "dependencies": [
      10
    ],
    "params": {
      "java_path": "java",
      "picard_path": "/opt/picard.jar",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "samtools",
    "subcommand": "local_realignment",
    "input_dir": {
      "bam": "/work/output/01_ReadMapping/03_Dedup"
    },
    "output_dir": "/work/output/01_ReadMapping/03_Dedup",
    "dependencies": [
      10
    ],
    "params": {
      "tool_path": "samtools",
      "th": "5"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "haplotype_caller",
    "input_dir": {
      "bam": "/work/output/01_ReadMapping/03_Dedup",
      "reference": "/work/input/ref"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "parallelize": true,
    "dependencies": [
      11,
      12,
      13
    ],
    "params": {
      "java_path": "java",
      "memory": "20",
      "tool_path": "gatk",
      "th": "5",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "combine_gvcfs",
    "input_dir": {
      "reference": "/work/input/ref",
      "gvcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "dependencies": [
      14
    ],
    "params": {
      "java_path": "java",
      "memory": "20",
      "vcf_prefix": "test",
      "tool_path": "gatk",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "genotyping",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "dependencies": [
      15
    ],
    "params": {
      "java_path": "java",
      "memory": "20",
      "tool_path": "gatk",
      "vcf_prefix": "test",
      "reference": "cow.chr1.fa"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "varint_selection",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "dependencies": [
      16
    ],
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "variant_filtering",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "dependencies": [
      17
    ],
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10",
      "filter_expression": "default"
    }
  },
  {
    "tool": "gatk",
    "subcommand": "select_variants",
    "input_dir": {
      "reference": "/work/input/ref",
      "vcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/02_VariantCalling",
    "dependencies": [
      18
    ],
    "params": {
      "reference": "cow.chr1.fa",
      "vcf_prefix": "test",
      "java_path": "java",
      "tool_path": "gatk",
      "memory": "10"
    }
  },
  {
    "tool": "vcftools",
    "subcommand": "filter",
    "input_dir": {
      "vcf": "/work/output/02_VariantCalling"
    },
    "output_dir": "/work/output/03_PostProcessing/01_VcfFilter",
    "parallelize": false,
    "dependencies": [
      19
    ],
    "params": {
      "vcftools_path": "vcftools",
      "vcf_prefix": "test"
    }
  },
  {
    "tool": "plink",
    "subcommand": "plink",
    "input_dir": {
      "vcf": "/work/output/03_PostProcessing/01_VcfFilter"
    },
    "output_dir": "/work/output/03_PostProcessing/02_Plink",
    "parallelize": false,
    "dependencies": [
      20
    ],
    "params": {
      "plink_path": "plink",
      "geno": 0.01,
      "maf": 0.05,
      "hwe": "1e-06",
      "chr-set": 1,
      "vcf_prefix": "test"
    }
  },
  {
    "tool": "hapmap",
    "subcommand": "vcf2hapmap",
    "input_dir": {
      "vcf": "/work/output/03_PostProcessing/01_VcfFilter"
    },
    "output_dir": "/work/output/03_PostProcessing/03_Hapmap",
    "parallelize": false,
    "dependencies": [
      20
    ],
    "params": {
      "perl_path": "perl",
      "vcf_prefix": "test"
    }
  },
  {
    "tool": "admixtureproportion",
    "subcommand": "convertf",
    "input_dir": {
      "plink": "/work/output/03_Postprocessing/plink"
    },
    "output_dir": "/work/output/04_Population/AdmixtureProportion",
    "params": {
      "plink_prefix": "/work/output/03_Postprocessing/plink/ALL",
      "result_prefix": "Admixtools_result"
    }
  },
  {
    "tool": "admixtureproportion",
    "subcommand": "qp3pop",
    "input_dir": {
      "convertf": "/work/output/04_Population/AdmixtureProportion/admixtools_convert"
    },
    "output_dir": "/work/output/04_Population/AdmixtureProportion",
    "dependencies": [
      1
    ],
    "params": {
      "result_prefix": "Admixtools_result",
      "sample_param": "/work/input/main_sample.txt",
      "sample_subcommands": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "admixtureproportion",
    "subcommand": "qp4diff",
    "input_dir": {
      "convertf": "/work/output/04_Population/AdmixtureProportion/admixtools_convert"
    },
    "output_dir": "/work/output/04_Population/AdmixtureProportion",
    "parallelize": true,
    "dependencies": [
      1
    ],
    "params": {
      "result_prefix": "Admixtools_result",
      "sample_param": "/work/input/main_sample.txt",
      "sample_subcommands": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "admixtureproportion",
    "subcommand": "qpdstat",
    "input_dir": {
      "convertf": "/work/output/04_Population/AdmixtureProportion/admixtools_convert"
    },
    "output_dir": "/work/output/04_Population/AdmixtureProportion",
    "parallelize": true,
    "dependencies": [
      1
    ],
    "params": {
      "result_prefix": "Admixtools_result",
      "sample_param": "/work/input/main_sample.txt",
      "sample_subcommands": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "admixtureproportion",
    "subcommand": "f4stat",
    "input_dir": {
      "convertf": "/work/output/04_Population/AdmixtureProportion/admixtools_convert"
    },
    "output_dir": "/work/output/04_Population/AdmixtureProportion",
    "parallelize": true,
    "dependencies": [
      1
    ],
    "params": {
      "result_prefix": "Admixtools_result",
      "sample_param": "/work/input/main_sample.txt",
      "sample_subcommands": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "/opt/deepvariant/bin/run_deepvariant",
    "subcommand": "run_deepvariant",
    "input_dir": {
      "reads_dir": "/work/output/01_ReadMapping/03_Dedup",
      "ref": "/work/input/ref/cow.chr1.fa"
    },
    "params": {
      "model_type": "WGS",
      "output_vcf_dir": "/work/output/02_VariantCalling/02_VariantCalling_vcf",
      "output_gvcf_dir": "/work/output/02_VariantCalling/02_VariantCalling",
      "num_shards": 10,
      "vcf_stats_report": false
    }
  },
  {
    "tool": "samtools",
    "subcommand": "samtools_merge",
    "input_dir": {
      "bam": "/work/output/01_ReadMapping/04.ReadRegrouping"
    },
    "output_dir": "/work/output/04_Population/EffectiveSize",
    "params": {
      "samtools_path": "samtools",
      "samtools_merge_core": 10,
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "diploid_fq",
    "subcommand": "diploid_fq",
    "input_dir": {
      "bam": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/EffectiveSize",
    "dependencies": [
      1
    ],
    "params": {
      "bcftools_path": "bcftools",
      "vcfutils_path": "vcfutils.pl",
      "reference": "/work/input/data/ref/cow.chr1.fa",
      "max_depth": 250,
      "vcf_d": 10,
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "psmc",
    "subcommand": "fq2psmcfa",
    "input_dir": {
      "fastq": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/EffectiveSize",
    "dependencies": [
      2
    ],
    "params": {
      "q": 20,
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "psmc",
    "subcommand": "psmc",
    "input_dir": {
      "psmcfa": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/EffectiveSize",
    "dependencies": [
      3
    ],
    "params": {
      "n": 25,
      "t": 15,
      "r": 5,
      "p": "4+25*2+4+6",
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "psmc",
    "subcommand": "psmc_plot",
    "input_dir": {
      "psmc": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/EffectiveSize",
    "parallelize": true,
    "dependencies": [
      4
    ],
    "params": {
      "legend_order": "Angus,Simmental,Hanwoo,Jersey,Holstein",
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "internal",
    "subcommand": "prepare_fst_analysis",
    "description": "准备Fst分析参数和文件",
    "input_dir": {
      "vcf_input": "/work/output/02_VariantCalling/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      "sample_param": "/work/input/main_sample.txt"
    },
    "output_dir": "/work/output/04_Population/Fst",
    "params": {
      "sample_param_file": "/work/input/main_sample.txt",
      "target_groups": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "user_combinations": "${user_combinations}",
      "vcf_file": "/work/output/02_VariantCalling/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      "output_dir": "/work/output/04_Population/Fst"
    }
  },
  {
    "tool": "internal",
    "subcommand": "generate_fst_comparisons",
    "description": "生成所有群体比较组合配置",
    "input_dir": [
      "sample_ /work/output/04_Population/Fst"
    ],
    "output_dir": "/work/output/04_Population/Fst/comparisons",
    "dependencies": [
      1
    ],
    "params": {
      "sample_param_file": "/work/input/main_sample.txt",
      "target_groups": [
        "Angus",
        "Hanwoo",
        "Holstein",
        "Jersey",
        "Simmental"
      ],
      "user_combinations": {},
      "output_base_dir": "/work/output/04_Population/Fst/comparisons"
    }
  },
  {
    "tool": "vcftools",
    "subcommand": "calculate_fst",
    "description": "计算所有群体比较的Fst值",
    "input_dir": [
      "vcf_ /work/output/02_VariantCalling/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      {
        "comparison_configs": "/work/output/04_Population/Fst/comparisons"
      }
    ],
    "output_dir": "/work/output/04_Population/Fst/fst_results",
    "dependencies": [
      2
    ],
    "params": {
      "vcftools_path": "vcftools",
      "vcf_file": "/work/output/02_VariantCalling/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      "fst_window_size": 100000,
      "fst_window_step": 0,
      "comparison_configs": "/work/output/04_Population/Fst/comparisons/fst_comparisons.json",
      "output_base_dir": "/work/output/04_Population/Fst/fst_results"
    }
  },
  {
    "tool": "internal",
    "subcommand": "batch_process_fst",
    "description": "处理所有Fst结果文件中的染色体名称",
    "input_dir": {
      "fst_results": "/work/output/04_Population/Fst/comparisons"
    },
    "output_dir": "/work/output/04_Population/Fst/processed_results",
    "parallelize": true,
    "dependencies": [
      3
    ],
    "params": {
      "input_base_dir": "/work/output/04_Population/Fst/comparisons",
      "output_base_dir": "/work/output/04_Population/Fst/processed_results"
    }
  },
  {
    "tool": "rscript",
    "subcommand": "plot_all_manhattan",
    "description": "生成所有比较的Manhattan图可视化结果",
    "input_dir": {
      "processed_fst": "/work/output/04_Population/Fst/processed_results"
    },
    "output_dir": "/work/output/04_Population/Fst/visualizations",
    "parallelize": true,
    "dependencies": [
      4
    ],
    "params": {
      "input_directory": "/work/output/04_Population/Fst/processed_results",
      "output_directory": "/work/output/04_Population/Fst/visualizations",
      "plot_type": "pdf",
      "plot_width": 10,
      "plot_height": 6,
      "genomewide_line": 3,
      "colors": "#996600,#666600,#99991e,#cc0000,#ff0000,#ff00cc,#ffcccc,#ff9900,#ffcc00,#ffff00,#ccff00,#00ff00,#358000,#0000cc,#6699ff,#99ccff,#00ffff,#ccffff,#9900cc,#cc33ff,#cc99ff,#666666,#999999,#cccccc"
    }
  },
  {
    "tool": "poplddecay",
    "subcommand": "make_samplelist",
    "input_dir": {
      "sample": "/work/input/data"
    },
    "output_dir": "/work/output/04_Population/LdDecay",
    "params": {
      "sample_param": "/work/input/main_sample.txt",
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "poplddecay",
    "subcommand": "poplddecay",
    "input_dir": {
      "sample": "/work/output/04_Population/LdDecay"
    },
    "output_dir": "/work/output/04_Population/LdDecay",
    "dependencies": [
      1
    ],
    "params": {
      "vcf": "/work/output/02_VariantCalling/VariantCalling/FINAL/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      "max_dist": [
        "500",
        "1000",
        "5000",
        "10000"
      ],
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "perl",
    "subcommand": "plot_multipop",
    "input_dir": {
      "ld_stats": "/work/output/04_Population/LdDecay"
    },
    "output_dir": "/work/output/04_Population/LdDecay",
    "dependencies": [
      2
    ],
    "params": {
      "max_dist": [
        "500",
        "1000",
        "5000",
        "10000"
      ],
      "sample_names": [
        "Angus",
        "Simmental",
        "Hanwoo",
        "Jersey",
        "Holstein"
      ]
    }
  },
  {
    "tool": "msmc",
    "subcommand": "msmc_mask",
    "output_dir": "/work/output/04_Population/MSMC",
    "params": {
      "bwa_path": "bwa",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa",
      "threads": 20
    }
  },
  {
    "tool": "fasize",
    "subcommand": "estimate_fasta_size",
    "output_dir": "/work/output/04_Population/MSMC",
    "params": {
      "faSize": "faSize",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa"
    }
  },
  {
    "tool": "samtools",
    "subcommand": "bam_index",
    "input_dir": {
      "bam": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/MSMC",
    "params": {
      "samtools_path": "samtools",
      "sample_param": "/work/input/main_sample.txt",
      "threads": 20
    }
  },
  {
    "tool": "msmc",
    "subcommand": "bam_to_vcf",
    "input_dir": {
      "bam": "/work/output/04_Population/EffectiveSize"
    },
    "output_dir": "/work/output/04_Population/MSMC",
    "dependencies": [
      2,
      3
    ],
    "params": {
      "samtools_path": "samtools",
      "bcftools_path": "bcftools",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa",
      "sample_param": "/work/input/main_sample.txt",
      "threads": 20
    }
  },
  {
    "tool": "msmc",
    "subcommand": "generate_msmc_input",
    "input_dir": {
      "vcf": "/work/output/04_Population/MSMC/01_inputGeneration"
    },
    "output_dir": "/work/output/04_Population/MSMC",
    "dependencies": [
      4
    ],
    "params": {
      "python_path": "python3",
      "sample_param": "/work/input/main_sample.txt",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa"
    }
  },
  {
    "tool": "msmc2",
    "subcommand": "msmc2",
    "input_dir": {
      "msmc_input": "/work/output/04_Population/MSMC/01_inputGeneration"
    },
    "output_dir": "/work/output/04_Population/MSMC",
    "dependencies": [
      5
    ],
    "params": {
      "msmc_path": "msmc2_Linux",
      "sample_param": "/work/input/main_sample.txt",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa",
      "i": 20,
      "r": 0.25,
      "p": "1*2+25*1+1*2+1*3"
    }
  },
  {
    "tool": "rscript",
    "subcommand": "vis_msmc",
    "input_dir": {
      "msmc_results": "/work/output/04_Population/MSMC/02_runMSMC"
    },
    "output_dir": "/work/output/04_Population/MSMC",
    "dependencies": [
      6
    ],
    "params": {
      "sample_param": "/work/input/main_sample.txt"
    }
  },
  {
    "tool": "gcta",
    "subcommand": "gcta_grm",
    "description": "构建遗传关系矩阵(GRM)",
    "input_dir": {
      "plink_data": "/work/output/03_Postprocessing/plink"
    },
    "output_dir": "/work/output/04_Population/PCA/GRM",
    "params": {
      "gcta_path": "gcta64",
      "plink_prefix": "/work/output/03_Postprocessing/plink/ALL",
      "autosome_num": 1,
      "output_prefix": "/work/output/04_Population/PCA/GRM/ALL"
    }
  },
  {
    "tool": "gcta",
    "subcommand": "gcta_pca",
    "description": "执行主成分分析",
    "input_dir": {
      "grm_data": "/work/output/04_Population/PCA/GRM"
    },
    "output_dir": "/work/output/04_Population/PCA/PCA",
    "dependencies": [
      1
    ],
    "params": {
      "gcta_path": "gcta64",
      "grm_prefix": "/work/output/04_Population/PCA/GRM/ALL",
      "pca_num": 20,
      "output_prefix": "/work/output/04_Population/PCA/PCA/ALL",
      "actual_pc_output": "/work/output/04_Population/PCA/PCA/actual_pc_number.txt"
    }
  },
  {
    "tool": "internal",
    "subcommand": "process_pca_results",
    "description": "处理PCA结果生成样本信息文件",
    "input_dir": {
      "pca_output": "/work/output/04_Population/PCA/PCA",
      "sample_info_dir": "${global.sample_param_file%/*}"
    },
    "output_dir": "/work/output/04_Population/PCA",
    "dependencies": [
      2
    ],
    "params": {
      "eigenvec_file": "/work/output/04_Population/PCA/PCA/ALL.eigenvec",
      "sample_param_file": "${global.sample_param_file}",
      "output_info_file": "/work/output/04_Population/PCA/PCs.info",
      "max_pcs": 20,
      "actual_pc_file": "/work/output/04_Population/PCA/PCA/actual_pc_number.txt"
    }
  },
  {
    "tool": "rscript",
    "subcommand": "vis_pca",
    "description": "可视化PCA结果",
    "input_dir": {
      "pca_data": "/work/output/04_Population/PCA"
    },
    "output_dir": "/work/output/04_Population/PCA/plots",
    "dependencies": [
      3
    ],
    "params": {
      "pca_title": "PCA analysis",
      "results_pcnum": "/work/output/04_Population/PCA/PCA/actual_pc_number.txt",
      "eigenval_file": "/work/output/04_Population/PCA/PCA/ALL.eigenval",
      "pc_info_file": "/work/output/04_Population/PCA/PCs.info",
      "obj_variance": 80,
      "max_pc": 5,
      "output_dir": "/work/output/04_Population/PCA"
    }
  },
  {
    "tool": "perl",
    "subcommand": "hapmap_filt",
    "description": "过滤HAPMAP文件以提高分析质量",
    "input_dir": {
      "raw_hapmap": "/work/output/03_Postprocessing/Hapmap/ALL.variant.combined.GT.SNP.flt.hapmap"
    },
    "output_dir": "/work/output/04_Population/PhylogeneticTree/",
    "params": {
      "hapmap_filt_script": "/PAPipe/bin/script/HAPMAP_FILT.pl",
      "input_hapmap": "/work/output/03_Postprocessing/Hapmap/ALL.variant.combined.GT.SNP.flt.hapmap",
      "output_hapmap": "/work/output/04_Population/PhylogeneticTree/filtered.hapmap"
    }
  },
  {
    "tool": "shell",
    "subcommand": "snphylo",
    "description": "使用SNPhylo构建最大似然系统发育树",
    "input_dir": {
      "filtered_hapmap": "/work/output/04_Population/PhylogeneticTree/filtered.hapmap"
    },
    "output_dir": "/work/output/04_Population/PhylogeneticTree/",
    "dependencies": [
      1
    ],
    "params": {
      "hapmap_file": "/work/output/03_Postprocessing/Hapmap/ALL.variant.combined.GT.SNP.flt.hapmap",
      "output_prefix": "snphylo",
      "l_param": 0.7,
      "m_param": 0,
      "M_param": 0.02,
      "threads": 15,
      "output_log": "/work/output/04_Population/PhylogeneticTree/snphylo.log"
    }
  },
  {
    "tool": "internal",
    "subcommand": "tree_adjust",
    "description": "根据名称匹配文件调整树节点名称",
    "input_dir": {
      "ml_tree": "/work/output/04_Population/PhylogeneticTree/snphylo.ml.tree",
      "name_mapping": "/work/output/03_Postprocessing/Hapmap/hapmap.namematch.txt"
    },
    "output_dir": "/work/output/04_Population/PhylogeneticTree/",
    "dependencies": [
      2
    ],
    "params": {
      "tree_file": "/work/output/04_Population/PhylogeneticTree/snphylo.ml.tree",
      "name_match_file": "/work/output/03_Postprocessing/Hapmap/hapmap.namematch.txt",
      "output_tree_file": "/work/output/04_Population/PhylogeneticTree/snphylo.ml.tree"
    }
  },
  {
    "tool": "rscript",
    "subcommand": "tree_visualization",
    "description": "生成系统发育树可视化图",
    "input_dir": {
      "tree_results": "/work/output/04_Population/PhylogeneticTree/"
    },
    "output_dir": "/work/output/04_Population/PhylogeneticTree/visualization",
    "dependencies": [
      3
    ],
    "params": {
      "tree_file": "/work/output/04_Population/PhylogeneticTree/snphylo.ml.tree",
      "sample_number": 25,
      "output_dir": "/work/output/04_Population/PhylogeneticTree/"
    }
  },
  {
    "tool": "vcftools",
    "subcommand": "vcf_filter_plink2",
    "output_dir": "/work/output/04_Population/Plink2",
    "params": {
      "vcftools_path": "vcftools",
      "vcf_input": "/work/output/02_VariantCalling/VariantCalling/ALL.variant.combined.GT.SNP.flt.vcf.gz",
      "non_autosome_list": "",
      "pop_name": "PCA"
    }
  },
  {
    "tool": "plink2",
    "subcommand": "make_pgen",
    "input_dir": {
      "vcf": "/work/output/04_Population/Plink2"
    },
    "output_dir": "/work/output/04_Population/Plink2",
    "dependencies": [
      1
    ],
    "params": {
      "non_autosome_list": "",
      "autosome_cnt": 1,
      "pop_name": "PCA",
      "threads": 20
    }
  },
  {
    "tool": "plink2",
    "subcommand": "pca",
    "input_dir": {
      "pgen": "/work/output/04_Population/Plink2"
    },
    "output_dir": "/work/output/04_Population/Plink2",
    "dependencies": [
      2
    ],
    "params": {
      "pca_num": 10,
      "threads": 20
    }
  },
  {
    "tool": "plink2",
    "subcommand": "project_pca",
    "input_dir": {
      "pca": "/work/output/04_Population/Plink2"
    },
    "output_dir": "/work/output/04_Population/Plink2",
    "dependencies": [
      3
    ],
    "params": {
      "pca_num": 10,
      "threads": 20
    }
  },
  {
    "tool": "internal",
    "subcommand": "extract_group",
    "input_dir": {
      "project": "/work/output/04_Population/Plink2"
    },
    "output_dir": "/work/output/04_Population/Plink2",
    "dependencies": [
      4
    ],
    "params": {}
  },
  {
    "tool": "internal",
    "subcommand": "prepare_structure_files",
    "description": "准备Structure分析输入文件（群体和颜色文件）",
    "input_dir": {
      "bed_input": "/work/output/03_Postprocessing/plink/ALL.bed",
      "sample_param": "/work/input/main_sample.txt"
    },
    "output_dir": "/work/output/04_Population/Structure",
    "params": {
      "sample_param_file": "/work/input/main_sample.txt",
      "output_pop_file": "/work/output/04_Population/Structure/Structure_result.pop",
      "output_color_file": "/work/output/04_Population/Structure/Structure_result.color",
      "max_k_value": 5
    }
  },
  {
    "tool": "admixture",
    "subcommand": "admixture_analysis",
    "description": "运行Admixture K值范围分析",
    "input_dir": {
      "bed_files": "/work/output/04_Population/Structure"
    },
    "output_dir": "/work/output/04_Population/Structure",
    "dependencies": [
      1
    ],
    "params": {
      "bed_file": "/work/output/03_Postprocessing/plink/ALL.bed",
      "k_start": 2,
      "k_end": 5,
      "admixture_path": "admixture",
      "jx_threads": 20
    }
  },
  {
    "tool": "zip",
    "subcommand": "compress_files",
    "description": "压缩Admixture分析结果文件",
    "input_dir": {
      "admixture_output": "/work/output/04_Population/Structure"
    },
    "output_dir": "/work/output/04_Population/Structure",
    "dependencies": [
      2
    ],
    "params": {
      "zip_path": "zip",
      "output_zip": "/work/output/04_Population/Structure/Structure_result.clumpak.zip",
      "input_files": "/work/output/04_Population/Structure/*.Q"
    }
  },
  {
    "tool": "perl",
    "subcommand": "clumpak_analysis",
    "description": "使用CLUMPAK进行结果可视化",
    "input_dir": {
      "compressed_results": "/work/output/04_Population/Structure",
      "population_file": "/work/output/04_Population/Structure/Structure_result.pop",
      "color_scheme": "/work/output/04_Population/Structure/Structure_result.color"
    },
    "output_dir": "/work/output/04_Population/Structure/results",
    "dependencies": [
      3
    ],
    "params": {
      "input_zip_file": "/work/output/04_Population/Structure/Structure_result.clumpak.zip",
      "indtopop_file": "/work/output/04_Population/Structure/Structure_result.pop",
      "colors_file": "/work/output/04_Population/Structure/Structure_result.color",
      "output_dir": "/work/output/04_Population/Structure",
      "analysis_identifier": 100
    }
  },
  {
    "tool": "vcf_filter",
    "subcommand": "vcf_filter_sweepfinder2",
    "output_dir": "/work/output/04_Population/SweepFinder2",
    "params": {
      "plink_path": "plink",
      "bgzip_path": "bgzip",
      "tabix_path": "tabix",
      "python_path": "python3",
      "sample_param": "/work/input/main_sample.txt",
      "plink": "/work/output/03_Postprocessing/plink/ALL",
      "non_autosome_list": "",
      "autosome_num": 1
    }
  },
  {
    "tool": "vcftools",
    "subcommand": "vcf_to_sf2",
    "input_dir": {
      "vcf": "/work/output/04_Population/SweepFinder2"
    },
    "output_dir": "/work/output/04_Population/SweepFinder2",
    "dependencies": [
      1,
      2
    ],
    "params": {
      "vcftools_path": "vcftools",
      "sample_param": "/work/input/main_sample.txt",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa"
    }
  },
  {
    "tool": "sweepfinder2",
    "subcommand": "sweepfinder2",
    "input_dir": {
      "sf2_input": "/work/output/04_Population/SweepFinder2"
    },
    "output_dir": "/work/output/04_Population/SweepFinder2",
    "dependencies": [
      3
    ],
    "params": {
      "sweepfinder_path": "SweepFinder2",
      "sample_param": "/work/input/main_sample.txt",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa",
      "grid_size": 1000,
      "threads": 20
    }
  },
  {
    "tool": "rscript",
    "subcommand": "vis_sweepfinder2",
    "input_dir": {
      "sf2_results": "/work/output/04_Population/SweepFinder2"
    },
    "output_dir": "/work/output/04_Population/SweepFinder2",
    "dependencies": [
      4
    ],
    "params": {
      "sample_param": "/work/input/main_sample.txt",
      "ref_fa": "/work/input/data/ref/cow.chr1.fa"
    }
  },
  {
    "tool": "vcftools",
    "subcommand": "vcf_filter_treemix",
    "output_dir": "/work/output/04_Population/Treemix",
    "params": {
      "vcftools_path": "vcftools",
      "vcf_input": "/work/output/02_VariantCalling/VariantCalling/FINAL/ALL.variant.combined.GT.SNP.flt.vcf.gz"
    }
  },
  {
    "tool": "plink2",
    "subcommand": "ld_pruning",
    "input_dir": {
      "vcf": "/work/output/04_Population/Treemix"
    },
    "output_dir": "/work/output/04_Population/Treemix",
    "dependencies": [
      1
    ],
    "params": {
      "plink_path": "plink",
      "ld_pruning_threshold": 0.1
    }
  },
  {
    "tool": "bcftools",
    "subcommand": "generate_clust",
    "output_dir": "/work/output/04_Population/Treemix",
    "params": {
      "bcftools_path": "bcftools",
      "vcf_input": "/work/output/02_VariantCalling/VariantCalling/FINAL/ALL.variant.combined.GT.SNP.flt.vcf.gz"
    }
  },
  {
    "tool": "plink2",
    "subcommand": "vcf_to_treemix",
    "input_dir": {
      "ld_pruned": "/work/output/04_Population/Treemix",
      "clust": "/work/output/04_Population/Treemix"
    },
    "output_dir": "/work/output/04_Population/Treemix",
    "dependencies": [
      2,
      3
    ],
    "params": {
      "python2_path": "python2",
      "plink_path": "plink"
    }
  },
  {
    "tool": "treemix",
    "subcommand": "treemix",
    "input_dir": {
      "treemix_input": "/work/output/04_Population/Treemix"
    },
    "output_dir": "/work/output/04_Population/Treemix",
    "dependencies": [
      4
    ],
    "params": {
      "treemix_path": "treemix",
      "m": 4,
      "k": 2,
      "user_add": ""
    }
  },
  {
    "tool": "rscript",
    "subcommand": "vis_treemix",
    "input_dir": {
      "treemix_results": "/work/output/04_Population/Treemix"
    },
    "output_dir": "/work/output/04_Population/Treemix",
    "dependencies": [
      5
    ],
    "params": {
      "m": 4
    }
  }
]
